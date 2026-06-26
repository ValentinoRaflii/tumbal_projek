-- Seed data for testing

-- Insert admin user (password: admin123)
INSERT INTO users (username, email, password, wallet_address, role) 
VALUES ('admin', 'admin@donation.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LexYxQJ5GkU9YgBdK', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 'admin');

-- Insert donor user (password: donor123)
INSERT INTO users (username, email, password, wallet_address, role) 
VALUES ('donor1', 'donor1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LexYxQJ5GkU9YgBdK', '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 'donor');

-- Insert sample campaigns
INSERT INTO campaigns (blockchain_id, name, location, description, target_amount, end_date, status, created_by) 
VALUES (1, 'Gempa Cianjur Emergency', 'Cianjur, Jawa Barat', 'Bantuan darurat untuk korban gempa Cianjur. Kami menyalurkan makanan, obat-obatan, dan perlengkapan darurat.', 50.0, datetime('now', '+30 days'), 'active', 1);

INSERT INTO campaigns (blockchain_id, name, location, description, target_amount, end_date, status, created_by) 
VALUES (2, 'Banjir Jakarta Relief', 'Jakarta, DKI Jakarta', 'Bantuan untuk warga terdampak banjir di Jakarta. Fokus pada evakuasi dan kebutuhan dasar.', 75.0, datetime('now', '+45 days'), 'active', 1);

INSERT INTO campaigns (blockchain_id, name, location, description, target_amount, end_date, status, created_by) 
VALUES (3, 'Longsor Sumedang', 'Sumedang, Jawa Barat', 'Penanganan bencana longsor di Sumedang. Membutuhkan alat berat dan logistik.', 30.0, datetime('now', '+20 days'), 'active', 1);

-- Insert sample donation
INSERT INTO donations (user_id, campaign_id, amount, transaction_hash, status) 
VALUES (2, 1, 0.5, '0x1234567890123456789012345678901234567890123456789012345678901234', 'confirmed');

-- Update campaign current amount
UPDATE campaigns SET current_amount = 0.5 WHERE id = 1;

-- Insert sample proof
INSERT INTO proofs (campaign_id, title, description, image_url, uploaded_by) 
VALUES (1, 'Penyaluran Logistik Hari ke-1', 'Pendistribusian 100 paket sembako ke pengungsian', 'https://example.com/image1.jpg', 1);