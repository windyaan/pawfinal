const request = require('supertest');
const express = require('express');
const produkRoutes = require('../routes/produk'); // Sesuaikan path
const db = require('../database/db'); // Import database

jest.mock('../database/db'); // Mock database

const app = express();
app.use(express.json());
app.use('/api/produk', produkRoutes);

describe('DELETE /api/produk/:id', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Reset mock setelah setiap test
    });

    it('should delete a product successfully', async () => {
        db.query.mockImplementation((query, params, callback) => {
            callback(null, { affectedRows: 1 }); // Simulasi penghapusan berhasil
        });

        const response = await request(app).delete('/api/produk/1');
        expect(response.status).toBe(204); // No Content
    });

    it('should return 404 if product is not found', async () => {
        db.query.mockImplementation((query, params, callback) => {
            callback(null, { affectedRows: 0 }); // Simulasi produk tidak ditemukan
        });

        const response = await request(app).delete('/api/produk/999');
        expect(response.status).toBe(404);
        expect(response.text).toBe('Produk tidak ditemukan');
    });

    it('should handle database errors', async () => {
        db.query.mockImplementation((query, params, callback) => {
            callback(new Error('Database error')); // Simulasi error database
        });

        const response = await request(app).delete('/api/produk/1');
        expect(response.status).toBe(500);
        expect(response.text).toBe('Internal Server Error');
    });
});
