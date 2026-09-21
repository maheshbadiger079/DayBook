const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');

router.get('/', (req, res, next) => entryController.getEntries(req, res, next));
router.post('/', (req, res, next) => entryController.createEntry(req, res, next));
router.put('/:id', (req, res, next) => entryController.updateEntry(req, res, next));
router.delete('/:id', (req, res, next) => entryController.deleteEntry(req, res, next));

module.exports = router;
