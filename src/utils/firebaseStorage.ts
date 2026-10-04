import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase.ts';
import { TopicGame, TopicProgressStat, ChildProfile } from '../types.ts';

const GAMES_COLLECTION = 'games';
const CHILDREN_COLLECTION = 'children';
const PROGRESS_COLLECTION = 'progress';

/**
 * Save a single game or batch update to Firestore
 */
export async function saveGameToFirestore(game: TopicGame): Promise<void> {
  try {
    const docRef = doc(db, GAMES_COLLECTION, game.id);
    await setDoc(docRef, game, { merge: true });
  } catch (error) {
    console.error('Error saving game to Firestore:', error);
  }
}

/**
 * Delete a game from Firestore
 */
export async function deleteGameFromFirestore(gameId: string): Promise<void> {
  try {
    const docRef = doc(db, GAMES_COLLECTION, gameId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting game from Firestore:', error);
  }
}

/**
 * Load all games from Firestore
 */
export async function loadGamesFromFirestore(): Promise<TopicGame[]> {
  try {
    const colRef = collection(db, GAMES_COLLECTION);
    const snapshot = await getDocs(colRef);
    const games: TopicGame[] = [];
    snapshot.forEach((d) => {
      games.push(d.data() as TopicGame);
    });
    return games;
  } catch (error) {
    console.warn('Could not load games from Firestore:', error);
    return [];
  }
}

/**
 * Save children profiles to Firestore
 */
export async function saveChildToFirestore(child: ChildProfile): Promise<void> {
  try {
    const docRef = doc(db, CHILDREN_COLLECTION, child.id);
    await setDoc(docRef, child, { merge: true });
  } catch (error) {
    console.error('Error saving child profile to Firestore:', error);
  }
}

/**
 * Load children profiles from Firestore
 */
export async function loadChildrenFromFirestore(): Promise<ChildProfile[]> {
  try {
    const colRef = collection(db, CHILDREN_COLLECTION);
    const snapshot = await getDocs(colRef);
    const children: ChildProfile[] = [];
    snapshot.forEach((d) => {
      children.push(d.data() as ChildProfile);
    });
    return children;
  } catch (error) {
    console.warn('Could not load children from Firestore:', error);
    return [];
  }
}

/**
 * Save activity progress stat to Firestore
 */
export async function saveProgressToFirestore(stat: TopicProgressStat): Promise<void> {
  try {
    const docRef = doc(db, PROGRESS_COLLECTION, stat.topicId);
    await setDoc(docRef, stat, { merge: true });
  } catch (error) {
    console.error('Error saving progress stat to Firestore:', error);
  }
}

/**
 * Load progress stats from Firestore
 */
export async function loadProgressFromFirestore(): Promise<Record<string, TopicProgressStat>> {
  try {
    const colRef = collection(db, PROGRESS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const stats: Record<string, TopicProgressStat> = {};
    snapshot.forEach((d) => {
      const data = d.data() as TopicProgressStat;
      stats[data.topicId] = data;
    });
    return stats;
  } catch (error) {
    console.warn('Could not load progress from Firestore:', error);
    return {};
  }
}
