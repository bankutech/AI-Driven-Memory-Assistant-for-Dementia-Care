const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://root:Sm@13022006@localhost:3306/brainCare',
    multipleStatements: true
  });

  console.log("Setting up database triggers, views, and procedures...");

  try {
    // 1. Constraint
    await connection.query(`
      ALTER TABLE memories ADD CONSTRAINT chk_importance_range CHECK (importance_score BETWEEN 0.0 AND 1.0)
    `).catch(e => console.log("Constraint exists:", e.message));

    // 2. View
    await connection.query(`
      CREATE OR REPLACE VIEW DailyBriefingView AS 
      SELECT p.first_name, i.ai_summary, i.sentiment_score, i.started_at 
      FROM persons p 
      JOIN interactions i ON p.id = i.person_id 
      WHERE i.started_at >= CURDATE()
    `);

    // 3. Trigger 1
    await connection.query(`DROP TRIGGER IF EXISTS auto_update_last_seen`);
    await connection.query(`
      CREATE TRIGGER auto_update_last_seen 
      AFTER INSERT ON interactions 
      FOR EACH ROW 
      BEGIN 
          UPDATE persons  
          SET last_seen_at = NEW.started_at  
          WHERE id = NEW.person_id; 
      END
    `);

    // 4. Trigger 2
    await connection.query(`DROP TRIGGER IF EXISTS set_default_importance`);
    await connection.query(`
      CREATE TRIGGER set_default_importance 
      BEFORE INSERT ON memories 
      FOR EACH ROW 
      BEGIN 
          IF NEW.importance_score IS NULL THEN 
              SET NEW.importance_score = 0.5; 
          END IF; 
      END
    `);

    // 5. Procedure 1
    await connection.query(`DROP PROCEDURE IF EXISTS SocialStimulationReport`);
    await connection.query(`
      CREATE PROCEDURE SocialStimulationReport() 
      BEGIN 
          DECLARE done INT DEFAULT FALSE; 
          DECLARE p_name VARCHAR(50); 
          DECLARE p_id VARCHAR(36); 
          DECLARE total_engagement INT; 
          
          DECLARE person_cursor CURSOR FOR SELECT id, first_name FROM persons; 
          DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE; 
          
          OPEN person_cursor; 
          read_loop: LOOP 
              FETCH person_cursor INTO p_id, p_name; 
              IF done THEN LEAVE read_loop; END IF; 
              
              SELECT COUNT(*) INTO total_engagement FROM interactions  
              WHERE person_id = p_id AND started_at > DATE_SUB(NOW(), INTERVAL 7 DAY); 
              
              SELECT p_name AS Visitor, total_engagement AS Interactions_This_Week; 
          END LOOP; 
          CLOSE person_cursor; 
      END
    `);

    // 6. Procedure 2
    await connection.query(`DROP PROCEDURE IF EXISTS SafeDeletePerson`);
    await connection.query(`
      CREATE PROCEDURE SafeDeletePerson(IN person_uuid VARCHAR(36)) 
      BEGIN 
          DECLARE EXIT HANDLER FOR 1451 
          BEGIN 
              SELECT 'Error: Cannot delete person due to existing interaction logs. Purge logs first.' AS Message; 
          END; 
      DELETE FROM persons WHERE id = person_uuid; 
      END
    `);

    console.log("Triggers and Procedures created successfully!");

    console.log("Inserting sample data from report...");

    // Sample Patient
    await connection.query(`
      INSERT INTO patients (id, first_name, last_name, diagnosis_stage, created_at, updated_at)  
      VALUES ('82850a41-25f2-4e7a-95cc-46971b2ea841', 'John', 'Doe', 'Mild', '2026-02-11 18:17:24', '2026-02-11 18:17:24')
    `).catch(e => console.log("Patient exists: ", e.message));

    // Sample Persons
    await connection.query(`
      INSERT INTO persons (id, patient_id, first_name, last_name, nickname, relationship_label, bio, last_seen_at, created_at)  
      VALUES  
      ('1b55bef0-d153-4e77-8c6f-d7b7673b7856', '82850a41-25f2-4e7a-95cc-46971b2ea841', 'Sarah', 'Doe', NULL, 'Wife', 'Partner for 40 years. Loves gardening and botanical gardens.', '2026-02-11 21:31:32', '2026-02-11 21:02:03'), 
      ('556f7aa4-b9ef-4347-af97-1cb236a27cfd', '82850a41-25f2-4e7a-95cc-46971b2ea841', 'David', 'Doe', 'Davey', 'Son', 'Software engineer living in Seattle.', '2026-02-11 21:34:05', '2026-02-11 21:00:29'), 
      ('78aff67c-d57b-444f-acf0-135f5990b58b', '82850a41-25f2-4e7a-95cc-46971b2ea841', 'Dr. Aris', 'Smith', NULL, 'Cardiologist', 'Heart specialist at City Hospital.', '2026-02-11 21:32:14', '2026-02-11 21:01:26')
    `).catch(e => console.log("Persons exist: ", e.message));

    // Sample Memory
    await connection.query(`
      INSERT INTO memories (id, person_id, content, importance_score)  
      VALUES ('0312b18d-bc23-4c0d-8a90-a3335542fadd', '1b55bef0-d153-4e77-8c6f-d7b7673b7856', 'Sarah told me to find her if I need anything', 0.9)
    `).catch(e => console.log("Memory exists: ", e.message));

    // Sample Interactions
    await connection.query(`
      INSERT INTO interactions (id, person_id, transcript, ai_summary, sentiment_score)  
      VALUES 
      ('cd057b22-8c57-40df-a1a9-dcf2d9419786', '1b55bef0-d153-4e77-8c6f-d7b7673b7856', 'I am so excited for the botanical gardens and blooming tulips this Sunday!', 'Excited for botanical garden visit.', 0.9),
      ('b6f94168-ab9b-48ee-bf44-c8bbdb2bdd7c', '78aff67c-d57b-444f-acf0-135f5990b58b', 'Blood pressure is improving, but avoid salt and processed soups.', 'Advised low salt intake; blood pressure improving.', 0.4)
    `).catch(e => console.log("Interactions exist: ", e.message));

    console.log("Database successfully seeded!");

  } catch (err) {
    console.error("Error setting up triggers:", err);
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
