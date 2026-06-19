ALTER TABLE memories ADD CONSTRAINT chk_importance_range CHECK (importance_score BETWEEN 0.0 AND 1.0);

CREATE OR REPLACE VIEW DailyBriefingView AS 
SELECT p.first_name, i.ai_summary, i.sentiment_score, i.started_at 
FROM persons p 
JOIN interactions i ON p.id = i.person_id 
WHERE i.started_at >= CURDATE();

DELIMITER //

DROP TRIGGER IF EXISTS auto_update_last_seen //
CREATE TRIGGER auto_update_last_seen 
AFTER INSERT ON interactions 
FOR EACH ROW 
BEGIN 
    UPDATE persons  
    SET last_seen_at = NEW.started_at  
    WHERE id = NEW.person_id; 
END //

DROP TRIGGER IF EXISTS set_default_importance //
CREATE TRIGGER set_default_importance 
BEFORE INSERT ON memories 
FOR EACH ROW 
BEGIN 
    IF NEW.importance_score IS NULL THEN 
        SET NEW.importance_score = 0.5; 
    END IF; 
END //

DROP PROCEDURE IF EXISTS SocialStimulationReport //
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
END //

DROP PROCEDURE IF EXISTS SafeDeletePerson //
CREATE PROCEDURE SafeDeletePerson(IN person_uuid VARCHAR(36)) 
BEGIN 
    DECLARE EXIT HANDLER FOR 1451 
    BEGIN 
        SELECT 'Error: Cannot delete person due to existing interaction logs. Purge logs first.' AS Message; 
    END; 
DELETE FROM persons WHERE id = person_uuid; 
END //

DELIMITER ;
