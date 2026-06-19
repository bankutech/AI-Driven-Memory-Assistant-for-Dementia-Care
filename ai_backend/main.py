import asyncio
import json
import logging
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from aiortc import RTCPeerConnection, RTCSessionDescription
from database import get_person_by_id, get_latest_interaction

app = FastAPI(title="ForgetMeNot AI Inference Engine")

# Allow CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger("pc")
pcs = set()

# Global state to push SSE events to connected clients when a face is "recognized"
# In a real app, this would be tied to the specific WebRTC session.
latest_recognized_person = None
new_recognition_event = asyncio.Event()

class Offer(BaseModel):
    sdp: str
    type: str

@app.post("/offer")
async def offer(offer: Offer):
    """
    WebRTC Negotiation Endpoint.
    Receives SDP offer from Next.js, creates an RTCPeerConnection, and returns an SDP answer.
    """
    offer_description = RTCSessionDescription(sdp=offer.sdp, type=offer.type)
    pc = RTCPeerConnection()
    pcs.add(pc)

    @pc.on("datachannel")
    def on_datachannel(channel):
        @channel.on("message")
        def on_message(message):
            # Handle incoming data if needed
            pass

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        logger.info("Connection state is %s", pc.connectionState)
        if pc.connectionState == "failed" or pc.connectionState == "closed":
            await pc.close()
            pcs.discard(pc)

    @pc.on("track")
    def on_track(track):
        logger.info("Track %s received", track.kind)
        # In a real implementation, we would process the video frames here
        # using cv2, dlib, or face_recognition.
        # Example pseudo-code:
        # async def process_frames():
        #     while True:
        #         frame = await track.recv()
        #         img = frame.to_ndarray(format="bgr24")
        #         # run face detection/recognition
        #         recognize_face(img)
        # asyncio.create_task(process_frames())
        
        # MOCK IMPLEMENTATION: Simulate recognizing Sarah after 5 seconds
        async def simulate_recognition():
            await asyncio.sleep(5)
            # Sarah's UUID from the seeded database
            person_id = '1b55bef0-d153-4e77-8c6f-d7b7673b7856'
            trigger_recognition(person_id)
            
        asyncio.create_task(simulate_recognition())

    # Handle the offer
    await pc.setRemoteDescription(offer_description)
    
    # Create answer
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}

def trigger_recognition(person_id: str):
    """
    Called by the video processing pipeline when a face is recognized.
    Fetches the person's data and triggers the SSE event.
    """
    global latest_recognized_person
    person = get_person_by_id(person_id)
    if person:
        interaction = get_latest_interaction(person_id)
        
        latest_recognized_person = {
            "person_id": person["id"],
            "name": f"{person['first_name']} {person['last_name'] or ''}".strip(),
            "description": interaction["ai_summary"] if interaction else person["bio"],
            "relationship": person["relationship_label"]
        }
        new_recognition_event.set()

async def event_generator():
    """
    Generator for Server-Sent Events (SSE).
    Yields data whenever a new face is recognized by the video pipeline.
    """
    global latest_recognized_person
    while True:
        await new_recognition_event.wait()
        
        if latest_recognized_person:
            data = json.dumps(latest_recognized_person)
            yield f"event: conversation\ndata: {data}\n\n"
            
        new_recognition_event.clear()

@app.get("/stream/conversation")
async def stream_conversation(request: Request):
    """
    SSE Endpoint for the Frontend HUD.
    """
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.on_event("shutdown")
async def on_shutdown():
    # Close all active WebRTC connections
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()
