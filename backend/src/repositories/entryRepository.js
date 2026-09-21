const { query } = require('../config/db');

/**
 * Repository layer for Daybook Entries
 */
class EntryRepository {
  /**
   * Fetch all entries with optional filtering by type, status, or date
   */
  async findAll({ type, status, date } = {}) {
    let sql = `
      SELECT id, title, TO_CHAR(date, 'YYYY-MM-DD') as date, type, notes, status, created_at, updated_at 
      FROM daybook_entries 
      WHERE 1=1
    `;
    const params = [];

    if (type && type !== 'All') {
      params.push(type);
      sql += ` AND type = $${params.length}`;
    }

    if (status && status !== 'All') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (date) {
      params.push(date);
      sql += ` AND date = $${params.length}`;
    }

    sql += ' ORDER BY date DESC, id DESC';
    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find entry by ID
   */
  async findById(id) {
    const sql = `
      SELECT id, title, TO_CHAR(date, 'YYYY-MM-DD') as date, type, notes, status, created_at, updated_at 
      FROM daybook_entries 
      WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Create a new entry
   */
  async create({ title, date, type, notes = '', status = 'Pending' }) {
    const insertSql = `
      INSERT INTO daybook_entries (title, date, type, notes, status, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id;
    `;
    const result = await query(insertSql, [title, date, type, notes, status]);
    return this.findById(result.rows[0].id);
  }

  /**
   * Update an existing entry
   */
  async update(id, { title, date, type, notes, status }) {
    const fields = [];
    const params = [];

    if (title !== undefined) {
      params.push(title);
      fields.push(`title = $${params.length}`);
    }
    if (date !== undefined) {
      params.push(date);
      fields.push(`date = $${params.length}`);
    }
    if (type !== undefined) {
      params.push(type);
      fields.push(`type = $${params.length}`);
    }
    if (notes !== undefined) {
      params.push(notes);
      fields.push(`notes = $${params.length}`);
    }
    if (status !== undefined) {
      params.push(status);
      fields.push(`status = $${params.length}`);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = NOW()');
    params.push(id);

    const sql = `
      UPDATE daybook_entries
      SET ${fields.join(', ')}
      WHERE id = $${params.length}
      RETURNING id;
    `;
    const result = await query(sql, params);
    if (!result.rows[0]) return null;
    return this.findById(id);
  }

  /**
   * Delete an entry
   */
  async delete(id) {
    const sql = 'DELETE FROM daybook_entries WHERE id = $1 RETURNING id;';
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }
}

module.exports = new EntryRepository();
