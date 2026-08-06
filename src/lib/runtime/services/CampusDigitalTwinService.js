/**
 * Campus Digital Twin Service — Buildings, Rooms & Live Space Status
 *
 * Represents the physical campus as a digital twin: buildings, lecture
 * halls, study rooms, labs, libraries, parking, and queues. Powers
 * questions like "Where's the nearest empty study room?"
 *
 * Flow: Nexus → StudentIntelligenceLayer → CampusDigitalTwinService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class CampusDigitalTwinService extends BaseService {
  constructor() {
    super({
      id: 'campusDigitalTwin',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['find_spaces', 'get_queue_info', 'find_nearest_space', 'get_campus_status'],
    });
  }

  async _onInit() { logger.info('CampusDigitalTwinService initialized'); }

  async _onHealth() {
    const available = !!base44.entities?.CampusLocation;
    return { healthy: available, detail: available ? 'CampusLocation available' : 'CampusLocation missing' };
  }

  async findSpaces({ type, available, institutionId }) {
    const start = Date.now();
    try {
      const [locations, bookings] = await Promise.all([
        this._queryLocations(type, institutionId),
        this._queryBookings(institutionId),
      ]);

      const now = new Date();
      const bookedLocationIds = new Set(
        bookings
          .filter((b) => b.status === 'confirmed' && b.start_time && new Date(b.start_time) <= now && new Date(b.end_time) >= now)
          .map((b) => b.location_id || b.campus_location_id)
      );

      const spaces = locations.map((loc) => {
        const isAvailable = !bookedLocationIds.has(loc.id);
        return {
          id: loc.id,
          name: loc.name || 'Space',
          type: 'space',
          spaceType: loc.type || loc.category || 'room',
          building: loc.building,
          floor: loc.floor,
          capacity: loc.capacity,
          isAvailable,
          currentOccupancy: loc.current_occupancy || 0,
          location: loc.address || loc.building,
          matchScore: isAvailable ? 80 : 30,
        };
      });

      const filtered = spaces.filter((s) => !available || s.isAvailable === available);
      filtered.sort((a, b) => b.matchScore - a.matchScore);

      this._recordRequest(Date.now() - start);
      return filtered.slice(0, 10);
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Space search failed', { error: e.message });
      return [];
    }
  }

  async findNearestSpace({ type, fromLocation, institutionId }) {
    try {
      const spaces = await this.findSpaces({ type, available: true, institutionId });
      // In production, would use geolocation distance calculation
      // For now, return the first available spaces
      return {
        nearest: spaces[0] || null,
        alternatives: spaces.slice(1, 4),
        detail: spaces.length > 0
          ? `The nearest available ${type || 'space'} is ${spaces[0].name} in ${spaces[0].building || 'the main building'}.`
          : `No available ${type || 'spaces'} found right now.`,
      };
    } catch (e) {
      logger.error('Nearest space search failed', { error: e.message });
      return { nearest: null, alternatives: [], detail: 'Search failed' };
    }
  }

  async getCampusStatus({ institutionId }) {
    try {
      const [locations, events, maintenance] = await Promise.all([
        this._queryLocations(null, institutionId),
        this._queryActiveEvents(institutionId),
        this._queryMaintenance(institutionId),
      ]);

      const activeEvents = events.filter((e) => {
        if (!e.start_date) return false;
        const now = new Date();
        return new Date(e.start_date) <= now && (!e.end_date || new Date(e.end_date) >= now);
      });

      const openMaintenance = maintenance.filter((m) => m.status === 'open' || m.status === 'in_progress');

      return {
        totalSpaces: locations.length,
        activeEvents: activeEvents.length,
        activeEventNames: activeEvents.slice(0, 5).map((e) => e.title),
        openMaintenanceRequests: openMaintenance.length,
        affectedLocations: openMaintenance.map((m) => m.location).filter(Boolean),
        detail: `Campus has ${locations.length} spaces, ${activeEvents.length} active events, and ${openMaintenance.length} open maintenance requests.`,
      };
    } catch (e) {
      logger.error('Campus status failed', { error: e.message });
      return { totalSpaces: 0, activeEvents: 0 };
    }
  }

  async _queryLocations(type, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      if (type) filter.type = type;
      return await base44.entities.CampusLocation.filter(filter, '-created_date', 30);
    } catch { return []; }
  }
  async _queryBookings(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.CampusBooking.filter(filter, '-start_time', 30);
    } catch { return []; }
  }
  async _queryActiveEvents(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.CampusEvent.filter(filter, '-start_date', 20);
    } catch { return []; }
  }
  async _queryMaintenance(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.MaintenanceRequest.filter(filter, '-created_date', 20);
    } catch { return []; }
  }
}

export const campusDigitalTwinService = new CampusDigitalTwinService();
export default campusDigitalTwinService;