// Shared demo dataset + seeding logic used by both the CLI seed script
// and the auto-seed on first server boot.

export function relDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function demoData() {
  return {
    users: [
      ['Arun Kumar', 'patient', 'arun@demo.com', 'demo123'],
      ['Meera Kumar', 'caregiver', 'meera@demo.com', 'demo123']
    ],
    memories: [
      ['Family Dinner', 'Had dinner at home with Riya and Meera. Everyone shared stories about the week.', 'Family', relDate(-2), 'Home', 'Riya', null, 'family,dinner,home'],
      ['Visited Marina Beach with family', 'Evening walk along the shore. Enjoyed sunset and had roasted corn from the beach stall.', 'Places', relDate(-9), 'Marina Beach, Chennai', 'Meera', null, 'beach,family,outings'],
      ['College Friend Visit', 'Rajesh visited after ten years. We talked about hostel days and our favourite professors.', 'Friends', relDate(-15), 'Home', 'Rajesh', null, 'friends,college'],
      ['Doctor Appointment', 'Routine check-up with Dr. Lakshmi at the clinic. Brought all reports along.', 'Important', relDate(-21), 'Sunrise Clinic', 'Dr. Lakshmi', null, 'health,doctor,checkup'],
      ['Morning Walk at the Park', 'Walked two laps around the park and met Mr. Iyer near the entrance.', 'Personal', relDate(-4), 'Nageswara Park', 'Mr. Iyer', null, 'walk,exercise,park']
    ],
    people: [
      ['Riya', 'Daughter', 'Lives nearby. Visits every Sunday and calls every evening at 7 PM.', null, relDate(-2)],
      ['Meera', 'Wife', 'At home all day. Keeps the medicine box on the dining table.', null, relDate(0)],
      ['Rajesh', 'College Friend', 'Old college friend. Recently moved back to Chennai.', null, relDate(-15)],
      ['Dr. Lakshmi', 'Doctor', 'Family physician at Sunrise Clinic. Appointment on Thursdays.', null, relDate(-21)],
      ['Suresh', 'Caregiver', 'Helps with morning routine and daily walks.', null, relDate(-1)],
      ['Mr. Iyer', 'Neighbour', 'Friendly neighbour who joins the morning walks at the park.', null, relDate(-4)]
    ],
    reminders: [
      ['Take evening medicine', 'One tablet from the blue strip after dinner.', relDate(0), '20:00', 'High', 0],
      ['Doctor appointment', 'Check-up with Dr. Lakshmi at Sunrise Clinic. Bring the report file.', relDate(0), '17:30', 'High', 0],
      ['Call Riya', 'Video call with daughter.', relDate(0), '19:00', 'Normal', 0],
      ['Pay electricity bill', 'Online payment using the saved card.', relDate(1), '11:00', 'Normal', 0],
      ['Water the plants', 'Balcony plants need watering.', relDate(-1), '08:00', 'Low', 1]
    ],
    routines: [
      ['Wake up & morning walk', 'Short walk around the park with Suresh.', '06:30', 'Morning', 1],
      ['Breakfast', 'Idli and coffee at the dining table.', '08:00', 'Morning', 1],
      ['Reading the newspaper', 'Front page and the puzzle section.', '10:00', 'Afternoon', 0],
      ['Lunch & rest', 'Lunch followed by a short nap.', '13:00', 'Afternoon', 0],
      ['Evening tea & garden time', 'Tea in the balcony with Meera.', '16:30', 'Evening', 0],
      ['Evening medicine', 'One tablet from the blue strip after dinner.', '20:00', 'Evening', 0],
      ['Dinner', 'Dinner together at home.', '19:30', 'Evening', 0],
      ['Sleep', 'Lights out by 10 PM.', '22:00', 'Night', 0]
    ],
    contacts: [
      ['Riya', 'Daughter', '+919876543210', 'Emergency Contact'],
      ['Dr. Lakshmi', 'Doctor', '+919812345678', 'Doctor'],
      ['Suresh', 'Caregiver', '+919845098450', 'Caregiver'],
      ['Meera', 'Wife', '+919870012345', 'Emergency Contact']
    ],
    events: [
      ['Doctor appointment', 'Quarterly check-up with Dr. Lakshmi.', relDate(0), '17:30', 'Sunrise Clinic'],
      ['Family dinner at Riya\'s place', 'Dinner with Riya and family.', relDate(3), '19:00', 'Riya\'s Home'],
      ['Bhajan morning', 'Community bhajan at the neighbourhood hall.', relDate(6), '10:00', 'Community Hall'],
      ['Video call with grandchildren', 'Weekly call with the grandchildren abroad.', relDate(-2), '18:00', 'Home']
    ]
  };
}

export function seedDemoData(db) {
  const data = demoData();

  // Keep people in sync with memories (auto upsert on memory insert)
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_person_upsert_after_memory_insert
    AFTER INSERT ON memories
    WHEN NEW.person IS NOT NULL AND TRIM(NEW.person) != ''
    BEGIN
      INSERT OR IGNORE INTO people (name, relationship, description, last_interaction)
      SELECT NEW.person, 'Unknown', 'Auto-added from memory: ' || NEW.title, COALESCE(NEW.date, date('now'))
      WHERE NOT EXISTS (SELECT 1 FROM people WHERE lower(name) = lower(NEW.person));
    END;
  `);

  const insertAll = {
    users: db.prepare(`INSERT INTO users (name, role, email, password) VALUES (?, ?, ?, ?)`),
    memories: db.prepare(`INSERT INTO memories (title, description, category, date, location, person, image, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`),
    people: db.prepare(`INSERT INTO people (name, relationship, description, image, last_interaction) VALUES (?, ?, ?, ?, ?)`),
    reminders: db.prepare(`INSERT INTO reminders (title, description, date, time, priority, completed) VALUES (?, ?, ?, ?, ?, ?)`),
    routines: db.prepare(`INSERT INTO routines (title, description, time, period, completed) VALUES (?, ?, ?, ?, ?)`),
    contacts: db.prepare(`INSERT INTO contacts (name, relationship, phone, type) VALUES (?, ?, ?, ?)`),
    events: db.prepare(`INSERT INTO events (title, description, date, time, location) VALUES (?, ?, ?, ?, ?)`)
  };

  const tx = db.transaction(() => {
    // people must be inserted before memories so the memory trigger
    // doesn't create auto/duplicate person rows for known people
    data.users.forEach(r => insertAll.users.run(...r));
    data.people.forEach(r => insertAll.people.run(...r));
    data.memories.forEach(r => insertAll.memories.run(...r));
    data.reminders.forEach(r => insertAll.reminders.run(...r));
    data.routines.forEach(r => insertAll.routines.run(...r));
    data.contacts.forEach(r => insertAll.contacts.run(...r));
    data.events.forEach(r => insertAll.events.run(...r));
  });
  tx();
}

export function clearAll(db) {
  const tx = db.transaction(() => {
    db.exec(`DELETE FROM events; DELETE FROM contacts; DELETE FROM routines; DELETE FROM reminders; DELETE FROM people; DELETE FROM memories; DELETE FROM users; DELETE FROM sqlite_sequence WHERE name IN ('users','memories','people','reminders','routines','contacts','events');`);
  });
  tx();
}
