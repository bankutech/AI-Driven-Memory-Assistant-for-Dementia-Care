import LiveAssistant from "@/components/LiveAssistant";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function CameraDashboard() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-main)',
      padding: '1.5rem',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Link 
            href="/dashboard/patient" 
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-color)',
              border: '1px solid var(--surface-border)',
              color: 'var(--text-main)',
              fontSize: '1.25rem',
              textDecoration: 'none'
            }}
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              letterSpacing: '-0.025em',
              margin: 0,
              color: 'var(--text-main)'
            }}>Live Assistant</h1>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '1.125rem',
              margin: 0
            }}>Your AI Memory Companion</p>
          </div>
        </div>
      </div>

      {/* Main AR Component */}
      <div style={{
        width: '100%',
        maxWidth: '64rem',
        margin: '0 auto'
      }}>
        <LiveAssistant />
      </div>
      
      {/* Context/Instructions */}
      <div style={{
        width: '100%',
        maxWidth: '48rem',
        margin: '2rem auto 0 auto',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}>
        <p>
          Make sure your face and any visitors are clearly visible in the camera. 
          The AI will automatically identify who you are talking to and bring up helpful context on the screen.
        </p>
      </div>
    </div>
  );
}
