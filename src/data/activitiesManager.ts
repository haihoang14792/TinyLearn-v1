import { PreschoolActivity, AgeGroup, DevelopmentalDomainId, ActivityObservationRecord } from './activityTypes.ts';
import { ACTIVITIES_12_18 } from './activities-12-18.ts';
import { ACTIVITIES_18_24 } from './activities-18-24.ts';
import { db } from '../firebase.ts';
import { collection, doc, setDoc } from 'firebase/firestore';

export const ALL_ACTIVITIES: PreschoolActivity[] = [
  ...ACTIVITIES_12_18,
  ...ACTIVITIES_18_24,
];

export function getActivitiesByAge(ageGroup: AgeGroup): PreschoolActivity[] {
  return ageGroup === '12-18' ? ACTIVITIES_12_18 : ACTIVITIES_18_24;
}

export function getActivitiesByDomain(
  ageGroup: AgeGroup,
  domainId: DevelopmentalDomainId
): PreschoolActivity[] {
  const list = getActivitiesByAge(ageGroup);
  return list.filter((act) => act.domain.includes(domainId));
}

export function getActivityById(id: string): PreschoolActivity | undefined {
  return ALL_ACTIVITIES.find((a) => a.id === id);
}

// ==========================================
// OBSERVATION LOG STORAGE (NHẬT KÝ HOẠT ĐỘNG)
// ==========================================
const STORAGE_KEY_OBSERVATION = 'tinylearn_observation_records_v1';

export function loadObservationRecords(): ActivityObservationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OBSERVATION);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load observation records:', e);
  }
  return [];
}

export async function saveObservationRecord(
  record: ActivityObservationRecord
): Promise<void> {
  try {
    const records = loadObservationRecords();
    records.unshift(record);
    const trimmed = records.slice(0, 150);
    localStorage.setItem(STORAGE_KEY_OBSERVATION, JSON.stringify(trimmed));

    // Asynchronously save to Firebase progress collection
    const docRef = doc(db, 'progress', record.id);
    await setDoc(
      docRef,
      {
        id: record.id,
        gameId: record.activityId,
        childId: record.ageGroup,
        activityTitle: record.activityTitle,
        topic: record.topic,
        domainName: record.domainName,
        participationLevel: record.participationLevel,
        executionAbility: record.executionAbility,
        teacherNotes: record.teacherNotes,
        date: record.date,
        lastPlayedAt: record.timestamp,
      },
      { merge: true }
    ).catch(() => {});
  } catch (e) {
    console.warn('Failed to save observation record:', e);
  }
}

export function deleteObservationRecord(id: string): void {
  try {
    const records = loadObservationRecords();
    const updated = records.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY_OBSERVATION, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete observation record:', e);
  }
}

export function clearAllObservationRecords(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_OBSERVATION);
  } catch (e) {
    console.warn('Failed to clear observation records:', e);
  }
}
