import express from 'express';
import { 
  getStops,
  addStop, 
  removeStop, 
  updateStopPreferences 
} from '../controllers/stopController';

const router = express.Router();

router.get('/stops/:phoneNumber', getStops);
router.post('/stops', addStop);
router.delete('/stops/:phoneNumber', removeStop);
router.put('/stops/:phoneNumber/:stopName/preferences', updateStopPreferences);

export default router;