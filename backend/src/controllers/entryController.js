const entryRepository = require('../repositories/entryRepository');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Controller for Daybook Entries
 */
class EntryController {
  /**
   * GET /api/entries
   */
  async getEntries(req, res, next) {
    try {
      const { type, status, date } = req.query;
      const entries = await entryRepository.findAll({ type, status, date });
      return successResponse(res, entries, 'Entries fetched successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/entries
   */
  async createEntry(req, res, next) {
    try {
      const { title, date, type, notes, status } = req.body;

      if (!title || !title.trim()) {
        return errorResponse(res, 'Title ("What is it?") is required', 'VALIDATION_ERROR', 400);
      }
      if (!type || !['Activity', 'Project', 'Assignment'].includes(type)) {
        return errorResponse(res, 'Type must be one of: Activity, Project, Assignment', 'VALIDATION_ERROR', 400);
      }

      const entryDate = date || new Date().toISOString().split('T')[0];
      const entryStatus = status || 'Pending';

      const newEntry = await entryRepository.create({
        title: title.trim(),
        date: entryDate,
        type,
        notes: notes ? notes.trim() : '',
        status: entryStatus,
      });

      return successResponse(res, newEntry, 'Entry added to daybook', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/entries/:id
   */
  async updateEntry(req, res, next) {
    try {
      const { id } = req.params;
      const { title, date, type, notes, status } = req.body;

      const existing = await entryRepository.findById(id);
      if (!existing) {
        return errorResponse(res, 'Daybook entry not found', 'ENTRY_NOT_FOUND', 404);
      }

      const updated = await entryRepository.update(id, {
        title,
        date,
        type,
        notes,
        status,
      });

      return successResponse(res, updated, 'Entry updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/entries/:id
   */
  async deleteEntry(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await entryRepository.delete(id);
      if (!deleted) {
        return errorResponse(res, 'Daybook entry not found', 'ENTRY_NOT_FOUND', 404);
      }
      return successResponse(res, { id: Number(id) }, 'Entry deleted successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EntryController();
