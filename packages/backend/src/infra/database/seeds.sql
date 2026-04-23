-- Insert sample categories
INSERT OR IGNORE INTO categories (id, name) VALUES
('cat_animals', 'Animals'),
('cat_sports', 'Sports'),
('cat_movies', 'Movies'),
('cat_food', 'Food'),
('cat_technology', 'Technology');

-- Insert sample words for Animals
INSERT OR IGNORE INTO words (id, category_id, word) VALUES
('word_lion', 'cat_animals', 'Lion'),
('word_elephant', 'cat_animals', 'Elephant'),
('word_penguin', 'cat_animals', 'Penguin'),
('word_dolphin', 'cat_animals', 'Dolphin'),
('word_giraffe', 'cat_animals', 'Giraffe');

-- Insert sample words for Sports
INSERT OR IGNORE INTO words (id, category_id, word) VALUES
('word_basketball', 'cat_sports', 'Basketball'),
('word_tennis', 'cat_sports', 'Tennis'),
('word_soccer', 'cat_sports', 'Soccer'),
('word_swimming', 'cat_sports', 'Swimming'),
('word_volleyball', 'cat_sports', 'Volleyball');

-- Insert sample words for Movies
INSERT OR IGNORE INTO words (id, category_id, word) VALUES
('word_titanic', 'cat_movies', 'Titanic'),
('word_avatar', 'cat_movies', 'Avatar'),
('word_inception', 'cat_movies', 'Inception'),
('word_jaws', 'cat_movies', 'Jaws'),
('word_alien', 'cat_movies', 'Alien');

-- Insert sample words for Food
INSERT OR IGNORE INTO words (id, category_id, word) VALUES
('word_pizza', 'cat_food', 'Pizza'),
('word_sushi', 'cat_food', 'Sushi'),
('word_burger', 'cat_food', 'Burger'),
('word_pasta', 'cat_food', 'Pasta'),
('word_tacos', 'cat_food', 'Tacos');

-- Insert sample words for Technology
INSERT OR IGNORE INTO words (id, category_id, word) VALUES
('word_phone', 'cat_technology', 'Phone'),
('word_laptop', 'cat_technology', 'Laptop'),
('word_robot', 'cat_technology', 'Robot'),
('word_drone', 'cat_technology', 'Drone'),
('word_satellite', 'cat_technology', 'Satellite');
