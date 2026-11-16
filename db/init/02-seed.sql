-- Seed data for the chat feature (PostgreSQL)
-- Run AFTER schema.sql. All test users have the password: password123

BEGIN;

-- Empty all tables and reset the id counters, so the seed can be run again
TRUNCATE messages, conversation_participants, conversations, users
    RESTART IDENTITY CASCADE;

-- 20 users (id 1-20 in this order). User 1 is admin.
INSERT INTO users (email, username, password_hash, role, created_at) VALUES
('oliver@test.dk',  'oliver',  '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'admin', now() - interval '60 days'),
('filip@test.dk',   'filip',   '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '59 days'),
('emma@test.dk',    'emma',    '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '58 days'),
('noah@test.dk',    'noah',    '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '57 days'),
('ida@test.dk',     'ida',     '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '56 days'),
('william@test.dk', 'william', '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '55 days'),
('freja@test.dk',   'freja',   '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '54 days'),
('oscar@test.dk',   'oscar',   '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '53 days'),
('clara@test.dk',   'clara',   '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '52 days'),
('lucas@test.dk',   'lucas',   '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '51 days'),
('alma@test.dk',    'alma',    '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '50 days'),
('victor@test.dk',  'victor',  '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '49 days'),
('agnes@test.dk',   'agnes',   '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '48 days'),
('karl@test.dk',    'karl',    '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '47 days'),
('sofie@test.dk',   'sofie',   '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '46 days'),
('malthe@test.dk',  'malthe',  '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '45 days'),
('ella@test.dk',    'ella',    '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '44 days'),
('august@test.dk',  'august',  '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '43 days'),
('laura@test.dk',   'laura',   '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '42 days'),
('elias@test.dk',   'elias',   '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu', 'user',  now() - interval '41 days');

-- 20 conversations: 1-12 are 1:1 chats (no title), 13-20 are group chats
INSERT INTO conversations (title, is_group, created_by, created_at) VALUES
(NULL, false,  1, now() - interval '30 days'),   -- 1:  oliver + filip
(NULL, false,  3, now() - interval '30 days'),   -- 2:  oliver + emma
(NULL, false,  2, now() - interval '29 days'),   -- 3:  filip + noah
(NULL, false,  5, now() - interval '29 days'),   -- 4:  ida + william
(NULL, false,  7, now() - interval '28 days'),   -- 5:  freja + oscar
(NULL, false,  9, now() - interval '28 days'),   -- 6:  clara + lucas
(NULL, false, 11, now() - interval '27 days'),   -- 7:  alma + victor
(NULL, false, 13, now() - interval '27 days'),   -- 8:  agnes + karl
(NULL, false, 15, now() - interval '26 days'),   -- 9:  sofie + malthe
(NULL, false, 17, now() - interval '26 days'),   -- 10: ella + august
(NULL, false, 19, now() - interval '25 days'),   -- 11: laura + elias
(NULL, false,  3, now() - interval '25 days'),   -- 12: emma + ida
('Eksamensgruppe',   true,  1, now() - interval '24 days'),   -- 13
('Løbeklubben',      true,  4, now() - interval '24 days'),   -- 14
('Fredagsbar',       true,  7, now() - interval '23 days'),   -- 15
('Køkkenet 3. sal',  true, 14, now() - interval '23 days'),   -- 16
('Fodbold tirsdag',  true, 18, now() - interval '22 days'),   -- 17
('Studiegruppe DB2', true,  2, now() - interval '22 days'),   -- 18
('Sommerhus 2027',   true, 10, now() - interval '21 days'),   -- 19
('Brætspil',         true, 17, now() - interval '21 days');   -- 20

-- Participants: 2 per 1:1 chat, 3-5 per group chat
INSERT INTO conversation_participants (conversation_id, user_id, joined_at) VALUES
(1, 1, now() - interval '30 days'), (1, 2, now() - interval '30 days'),
(2, 1, now() - interval '30 days'), (2, 3, now() - interval '30 days'),
(3, 2, now() - interval '29 days'), (3, 4, now() - interval '29 days'),
(4, 5, now() - interval '29 days'), (4, 6, now() - interval '29 days'),
(5, 7, now() - interval '28 days'), (5, 8, now() - interval '28 days'),
(6, 9, now() - interval '28 days'), (6, 10, now() - interval '28 days'),
(7, 11, now() - interval '27 days'), (7, 12, now() - interval '27 days'),
(8, 13, now() - interval '27 days'), (8, 14, now() - interval '27 days'),
(9, 15, now() - interval '26 days'), (9, 16, now() - interval '26 days'),
(10, 17, now() - interval '26 days'), (10, 18, now() - interval '26 days'),
(11, 19, now() - interval '25 days'), (11, 20, now() - interval '25 days'),
(12, 3, now() - interval '25 days'), (12, 5, now() - interval '25 days'),
(13, 1, now() - interval '24 days'), (13, 2, now() - interval '24 days'), (13, 3, now() - interval '24 days'),
(14, 4, now() - interval '24 days'), (14, 6, now() - interval '24 days'), (14, 8, now() - interval '24 days'),
(14, 10, now() - interval '24 days'), (14, 12, now() - interval '24 days'),
(15, 7, now() - interval '23 days'), (15, 9, now() - interval '23 days'), (15, 11, now() - interval '23 days'),
(15, 13, now() - interval '23 days'),
(16, 14, now() - interval '23 days'), (16, 15, now() - interval '23 days'), (16, 16, now() - interval '23 days'),
(16, 17, now() - interval '23 days'),
(17, 18, now() - interval '22 days'), (17, 19, now() - interval '22 days'), (17, 20, now() - interval '22 days'),
(17, 6, now() - interval '22 days'),
(18, 2, now() - interval '22 days'), (18, 5, now() - interval '22 days'), (18, 9, now() - interval '22 days'),
(18, 12, now() - interval '22 days'), (18, 20, now() - interval '22 days'),
(19, 10, now() - interval '21 days'), (19, 11, now() - interval '21 days'), (19, 1, now() - interval '21 days'),
(19, 16, now() - interval '21 days'),
(20, 17, now() - interval '21 days'), (20, 8, now() - interval '21 days'), (20, 13, now() - interval '21 days'),
(20, 19, now() - interval '21 days');

-- Messages: every sender is a participant in the conversation
INSERT INTO messages (conversation_id, sender_id, body, created_at) VALUES
(1, 1, 'Hej Filip, har du tid til at kigge på databasen i dag?', now() - interval '20 days'),
(1, 2, 'Ja, efter frokost passer fint', now() - interval '20 days' + interval '10 minutes'),
(1, 1, 'Super, jeg sender schemaet', now() - interval '20 days' + interval '12 minutes'),
(2, 3, 'Tak for i går!', now() - interval '19 days'),
(2, 1, 'Selv tak, det var hyggeligt', now() - interval '19 days' + interval '30 minutes'),
(3, 2, 'Skal vi løbe i morgen?', now() - interval '18 days'),
(3, 4, 'Ja, kl. 7 ved søerne', now() - interval '18 days' + interval '5 minutes'),
(4, 5, 'Har du noterne fra forelæsningen?', now() - interval '17 days'),
(4, 6, 'Jeg sender dem i aften', now() - interval '17 days' + interval '1 hour'),
(5, 7, 'Kommer du til fredagsbar?', now() - interval '16 days'),
(5, 8, 'Helt sikkert', now() - interval '16 days' + interval '2 minutes'),
(6, 9, 'Hvornår er afleveringen?', now() - interval '15 days'),
(6, 10, 'Den 5. januar', now() - interval '15 days' + interval '3 minutes'),
(7, 11, 'Kan jeg låne din oplader?', now() - interval '14 days'),
(7, 12, 'Ja, den ligger i min taske', now() - interval '14 days' + interval '4 minutes'),
(8, 13, 'God weekend!', now() - interval '13 days'),
(8, 14, 'I lige måde', now() - interval '13 days' + interval '20 minutes'),
(9, 15, 'Er du hjemme?', now() - interval '12 days'),
(9, 16, 'Om ti minutter', now() - interval '12 days' + interval '1 minute'),
(10, 17, 'Spiller vi på søndag?', now() - interval '11 days'),
(10, 18, 'Ja, hos mig', now() - interval '11 days' + interval '15 minutes'),
(11, 19, 'Tillykke med praktikpladsen!', now() - interval '10 days'),
(11, 20, 'Tak!', now() - interval '10 days' + interval '6 minutes'),
(12, 3, 'Hvordan gik eksamen?', now() - interval '9 days'),
(12, 5, 'Fint, jeg fik 10', now() - interval '9 days' + interval '8 minutes'),
(13, 1, 'Velkommen i gruppen', now() - interval '8 days'),
(13, 2, 'Hvem laver docker-compose?', now() - interval '8 days' + interval '5 minutes'),
(13, 3, 'Det kan jeg godt tage', now() - interval '8 days' + interval '7 minutes'),
(13, 1, 'Fedt, så tager jeg seed-data', now() - interval '8 days' + interval '9 minutes'),
(14, 4, 'Intervaller på torsdag?', now() - interval '7 days'),
(14, 8, 'Jeg er med', now() - interval '7 days' + interval '10 minutes'),
(14, 12, 'Jeg kan desværre ikke', now() - interval '7 days' + interval '25 minutes'),
(15, 7, 'Hvem tager snacks med?', now() - interval '6 days'),
(15, 11, 'Det gør jeg', now() - interval '6 days' + interval '3 minutes'),
(16, 14, 'Hvem har taget min mælk?', now() - interval '5 days'),
(16, 16, 'Undskyld, jeg køber ny', now() - interval '5 days' + interval '40 minutes'),
(17, 18, 'Bane 3 kl. 18', now() - interval '4 days'),
(17, 6, 'Jeg tager bolde med', now() - interval '4 days' + interval '12 minutes'),
(18, 2, 'Har nogen forstået transaktioner?', now() - interval '3 days'),
(18, 9, 'BEGIN og COMMIT, og ROLLBACK hvis noget fejler', now() - interval '3 days' + interval '6 minutes'),
(18, 20, 'Tak, det giver mening', now() - interval '3 days' + interval '9 minutes'),
(19, 10, 'Jeg har fundet et hus i Hornbæk', now() - interval '2 days'),
(19, 1, 'Det ser godt ud', now() - interval '2 days' + interval '30 minutes'),
(20, 17, 'Hvilket spil tager vi på fredag?', now() - interval '1 day'),
(20, 13, 'Noget med kort, tak', now() - interval '1 day' + interval '4 minutes');

COMMIT;
