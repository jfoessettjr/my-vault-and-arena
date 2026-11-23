import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import {
  Trophy,
  Disc,
  BookOpen,
  CreditCard,
  Gamepad2,
  LayoutDashboard,
  Flag,
  Target,
  Shield,
  Plus,
  Search,
  RefreshCw,
  WifiOff,
  Wifi,
  AlertTriangle,
  Download,
  Upload,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Menu,
  Moon,
  Sun,
  Calendar,
  MapPin,
  Sparkles,
  Check,
  Lock,
  HelpCircle,
  Play,
  Layers,
  TrendingUp,
  Cloud,
  CloudOff,
  LogOut,
  UserCheck,
  Mail,
  KeyRound
} from 'lucide-react';

// ============================================================================
// FIREBASE INITIALIZATION (Follows Environment Globals with Safe Fallback)
// ============================================================================
const getEnvVar = (key) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {
    // ignore
  }
  return undefined;
};

const firebaseConfig =
  typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : {
        apiKey: getEnvVar('VITE_FIREBASE_API_KEY') || 'demo-api-key',
        authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || 'demo-app.firebaseapp.com',
        projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID') || 'demo-app',
        storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || 'demo-app.appspot.com',
        messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') || '000000000000',
        appId: getEnvVar('VITE_FIREBASE_APP_ID') || '1:000000000000:web:000000000000'
      };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// ============================================================================
// INITIAL STARTER DATA (Used when seeding an empty Cloud Vault)
// ============================================================================
const INITIAL_DATA = {
  sports: {
    nascar: [
      {
        id: 'nas-1',
        season: '2026',
        date: '2026-02-15',
        event: 'Daytona 500',
        venue: 'Daytona International Speedway, FL',
        winnerOrScore: 'Winner: William Byron (#24)',
        extraStat: 'Pole: Joey Logano (#22) • Purse: $28.0M',
        status: 'Completed',
        manualOverride: false,
        notes: 'Thrilling double-overtime finish. Watched live; great start to the Cup Series season.'
      },
      {
        id: 'nas-2',
        season: '2026',
        date: '2026-05-24',
        event: 'Coca-Cola 600',
        venue: 'Charlotte Motor Speedway, NC',
        winnerOrScore: 'Winner: Kyle Larson (#5)',
        extraStat: 'Pole: Christopher Bell (#20) • 400 Laps',
        status: 'Completed',
        manualOverride: true,
        notes: 'Manually corrected stage 2 winner and lap count after feed delay.'
      },
      {
        id: 'nas-3',
        season: '2026',
        date: '2026-08-16',
        event: 'FireKeepers Casino 400',
        venue: 'Michigan International Speedway, Brooklyn, MI',
        winnerOrScore: 'Winner: Tyler Reddick (#45)',
        extraStat: 'Home Track • 200 Laps',
        status: 'Completed',
        manualOverride: false,
        notes: 'Attended in person at MIS! Incredible 4-wide restarts into Turn 1.'
      },
      {
        id: 'nas-4',
        season: '2026',
        date: '2026-11-22',
        event: 'NASCAR Cup Series Championship',
        venue: 'Homestead-Miami Speedway, FL',
        winnerOrScore: 'TBD',
        extraStat: 'Championship 4 Finale',
        status: 'Upcoming',
        manualOverride: false,
        notes: 'Season finale showdown.'
      }
    ],
    pga: [
      {
        id: 'pga-1',
        season: '2026',
        date: '2026-04-12',
        event: 'The Masters Tournament',
        venue: 'Augusta National Golf Club, GA',
        winnerOrScore: 'Winner: Scottie Scheffler (-14)',
        extraStat: 'Purse: $20.0M • Runner-up: Ludvig Åberg (-11)',
        status: 'Completed',
        manualOverride: false,
        notes: 'Sunday Amen Corner birdie run sealed another Green Jacket.'
      },
      {
        id: 'pga-2',
        season: '2026',
        date: '2026-05-17',
        event: 'PGA Championship',
        venue: 'Aronimink Golf Club, PA',
        winnerOrScore: 'Winner: Rory McIlroy (-16)',
        extraStat: 'Major Championship • Purse: $18.5M',
        status: 'Completed',
        manualOverride: false,
        notes: 'Dominant driving accuracy all four rounds.'
      },
      {
        id: 'pga-3',
        season: '2026',
        date: '2026-06-21',
        event: 'U.S. Open',
        venue: 'Shinnecock Hills Golf Club, NY',
        winnerOrScore: 'Winner: Bryson DeChambeau (-6)',
        extraStat: 'Major Championship • Purse: $21.5M',
        status: 'Completed',
        manualOverride: true,
        notes: 'Manually logged playoff hole score details.'
      },
      {
        id: 'pga-4',
        season: '2026-27',
        date: '2026-12-03',
        event: 'Hero World Challenge',
        venue: 'Albany Golf Course, Bahamas',
        winnerOrScore: 'TBD',
        extraStat: '20-Player Invitational',
        status: 'Upcoming',
        manualOverride: false,
        notes: 'Holiday showcase event.'
      }
    ],
    msu_football: [
      {
        id: 'msufb-1',
        season: '2026-27',
        date: '2026-09-05',
        event: 'vs. Western Michigan Broncos',
        venue: 'Spartan Stadium, East Lansing, MI',
        msuScore: 38,
        oppScore: 14,
        outcome: 'W',
        winnerOrScore: 'W 38–14',
        extraStat: 'Home • Non-Conference',
        status: 'Completed',
        manualOverride: false,
        notes: 'Electric night opener in East Lansing.'
      },
      {
        id: 'msufb-2',
        season: '2026-27',
        date: '2026-10-24',
        event: 'at Michigan Wolverines',
        venue: 'Michigan Stadium, Ann Arbor, MI',
        msuScore: 27,
        oppScore: 24,
        outcome: 'W',
        winnerOrScore: 'W 27–24',
        extraStat: 'Away • Paul Bunyan Trophy',
        status: 'Completed',
        manualOverride: true,
        notes: 'Paul Bunyan Trophy comes back to East Lansing! Game-winning 48-yard FG.'
      },
      {
        id: 'msufb-3',
        season: '2026-27',
        date: '2026-11-07',
        event: 'at Ohio State Buckeyes',
        venue: 'Ohio Stadium, Columbus, OH',
        msuScore: 17,
        oppScore: 28,
        outcome: 'L',
        winnerOrScore: 'L 17–28',
        extraStat: 'Away • Big Ten',
        status: 'Completed',
        manualOverride: false,
        notes: 'Competitive through 3 quarters on the road.'
      },
      {
        id: 'msufb-4',
        season: '2026-27',
        date: '2026-11-28',
        event: 'vs. Penn State Nittany Lions',
        venue: 'Spartan Stadium, East Lansing, MI',
        msuScore: '',
        oppScore: '',
        outcome: 'TBD',
        winnerOrScore: 'TBD',
        extraStat: 'Home • Land-Grant Trophy',
        status: 'Upcoming',
        manualOverride: false,
        notes: 'Senior Day regular season finale.'
      }
    ],
    msu_basketball: [
      {
        id: 'msubb-1',
        season: '2026-27',
        date: '2026-11-10',
        event: 'vs. Kansas Jayhawks (Champions Classic)',
        venue: 'United Center, Chicago, IL',
        msuScore: 79,
        oppScore: 74,
        outcome: 'W',
        winnerOrScore: 'W 79–74',
        extraStat: 'Neutral • Champions Classic',
        status: 'Completed',
        manualOverride: false,
        notes: 'Statement win over #3 Kansas. +11 rebounding margin.'
      },
      {
        id: 'msubb-2',
        season: '2026-27',
        date: '2026-11-14',
        event: 'vs. Bowling Green Falcons',
        venue: 'Breslin Center, East Lansing, MI',
        msuScore: 86,
        oppScore: 62,
        outcome: 'W',
        winnerOrScore: 'W 86–62',
        extraStat: 'Home • Non-Conference',
        status: 'Completed',
        manualOverride: false,
        notes: 'Izzone in mid-season form.'
      },
      {
        id: 'msubb-3',
        season: '2026-27',
        date: '2026-12-08',
        event: 'at Purdue Boilermakers',
        venue: 'Mackey Arena, West Lafayette, IN',
        msuScore: '',
        oppScore: '',
        outcome: 'TBD',
        winnerOrScore: 'TBD',
        extraStat: 'Away • Big Ten',
        status: 'Upcoming',
        manualOverride: false,
        notes: 'Big Ten opener on the road.'
      }
    ],
    msu_hockey: [
      {
        id: 'msuhk-1',
        season: '2026-27',
        date: '2026-10-16',
        event: 'vs. Boston College Eagles',
        venue: 'Munn Ice Arena, East Lansing, MI',
        msuScore: 4,
        oppScore: 3,
        outcome: 'W',
        winnerOrScore: 'W 4–3 (OT)',
        extraStat: 'Home • Top-5 Showdown',
        status: 'Completed',
        manualOverride: true,
        notes: 'Overtime power-play winner! Munn Ice Arena was deafening.'
      },
      {
        id: 'msuhk-2',
        season: '2026-27',
        date: '2026-11-06',
        event: 'at Minnesota Golden Gophers',
        venue: '3M Arena at Mariucci, Minneapolis, MN',
        msuScore: 2,
        oppScore: 2,
        outcome: 'T',
        winnerOrScore: 'T 2–2 (SOW)',
        extraStat: 'Away • Big Ten Hockey',
        status: 'Completed',
        manualOverride: false,
        notes: 'Official NCAA tie with shootout extra point.'
      },
      {
        id: 'msuhk-3',
        season: '2026-27',
        date: '2026-12-04',
        event: 'vs. Michigan Wolverines',
        venue: 'Munn Ice Arena, East Lansing, MI',
        msuScore: '',
        oppScore: '',
        outcome: 'TBD',
        winnerOrScore: 'TBD',
        extraStat: 'Home • Big Ten Rivalry',
        status: 'Upcoming',
        manualOverride: false,
        notes: 'Friday night rivalry clash at Munn.'
      }
    ]
  },
  collections: {
    vinyl: [
      {
        id: 'vin-1',
        artist: 'Fleetwood Mac',
        title: 'Rumours',
        year: 1977,
        genre: 'Classic Rock',
        variant: '180g Clear Vinyl Reissue',
        condition: 'Mint',
        value: 42,
        spinCount: 19,
        notes: 'Dead-quiet pressing with dynamic analog warmth.'
      },
      {
        id: 'vin-2',
        artist: 'Pink Floyd',
        title: 'The Dark Side of the Moon',
        year: 1973,
        genre: 'Progressive Rock',
        variant: 'Original Harvest Pressing w/ Posters',
        condition: 'VG+',
        value: 95,
        spinCount: 27,
        notes: 'Picked up at Flat, Black & Circular in East Lansing.'
      },
      {
        id: 'vin-3',
        artist: 'Kendrick Lamar',
        title: 'good kid, m.A.A.d city',
        year: 2012,
        genre: 'Hip-Hop',
        variant: 'Milky Clear 2LP',
        condition: 'NM',
        value: 48,
        spinCount: 14,
        notes: 'Crisp low-end bass response.'
      }
    ],
    books: [
      {
        id: 'bk-1',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        genre: 'Sci-Fi',
        format: 'Hardcover',
        status: 'Completed',
        rating: 5,
        pages: 496,
        notes: 'Unputdownable science problem-solving and humor.'
      },
      {
        id: 'bk-2',
        title: 'The Boys in the Boat',
        author: 'Daniel James Brown',
        genre: 'Sports History',
        format: 'Paperback',
        status: 'Reading',
        rating: 4,
        pages: 404,
        notes: 'Currently on Chapter 11—incredible 1936 Olympic rowing story.'
      },
      {
        id: 'bk-3',
        title: 'Spartan Dawn: The Magic Johnson Era',
        author: 'Jack Ebling',
        genre: 'Sports Biography',
        format: 'Hardcover',
        status: 'TBR/Wishlist',
        rating: 0,
        pages: 320,
        notes: 'Next up on the Michigan State history shelf.'
      }
    ],
    cards: [
      {
        id: 'crd-1',
        player: 'Magic Johnson',
        yearSet: '1980-81 Topps',
        sport: 'Basketball',
        cardNumber: '#139 (w/ Bird & Erving)',
        parallel: 'Base Rookie Triple Panel',
        grading: 'PSA 8',
        purchasePrice: 410,
        value: 680,
        notes: 'Centerpiece MSU Spartan legend rookie card.'
      },
      {
        id: 'crd-2',
        player: 'Kenneth Walker III',
        yearSet: '2022 Panini Prizm',
        sport: 'Football',
        cardNumber: '#312',
        parallel: 'Silver Prizm Auto /99',
        grading: 'PSA 10',
        purchasePrice: 95,
        value: 165,
        notes: '2021 Doak Walker Award winner on-card signature.'
      },
      {
        id: 'crd-3',
        player: 'Jeff Gordon',
        yearSet: '1991 Traks',
        sport: 'NASCAR',
        cardNumber: '#1',
        parallel: 'Rookie Edition',
        grading: 'BGS 9.5',
        purchasePrice: 50,
        value: 110,
        notes: 'Gem Mint subgrades on corners and edges.'
      },
      {
        id: 'crd-4',
        player: 'Tiger Woods',
        yearSet: '2001 Upper Deck',
        sport: 'Golf / PGA',
        cardNumber: '#1',
        parallel: 'RC',
        grading: 'Raw',
        purchasePrice: 65,
        value: 60,
        notes: 'Clean surface in magnetic one-touch holder.'
      }
    ],
    games: [
      {
        id: 'gm-1',
        title: 'EA Sports College Football 26',
        platform: 'PS5',
        genre: 'Sports',
        status: 'Playing',
        hoursPlayed: 84,
        rating: 5,
        notes: 'Season 4 of Michigan State Dynasty mode; won the Rose Bowl!'
      },
      {
        id: 'gm-2',
        title: 'The Legend of Zelda: Tears of the Kingdom',
        platform: 'Switch',
        genre: 'Action-Adventure',
        status: 'Completed',
        hoursPlayed: 118,
        rating: 5,
        notes: 'All shrines finished; final boss fight is unforgettable.'
      },
      {
        id: 'gm-3',
        title: 'Elden Ring: Shadow of the Erdtree',
        platform: 'PC',
        genre: 'Action RPG',
        status: '100%',
        hoursPlayed: 142,
        rating: 5,
        notes: '100% achievements unlocked.'
      },
      {
        id: 'gm-4',
        title: 'Gran Turismo 7',
        platform: 'PS5',
        genre: 'Racing Sim',
        status: 'Backlog',
        hoursPlayed: 19,
        rating: 4,
        notes: 'Working through Master License tests.'
      }
    ]
  }
};

// Simulated Auto-Fetch Feed Payloads
const LIVE_FEED_UPDATES = [
  {
    category: 'nascar',
    item: {
      id: 'nas-live-1',
      season: '2026',
      date: '2026-11-15',
      event: 'Martinsville Playoff Elimination Race',
      venue: 'Martinsville Speedway, VA',
      winnerOrScore: 'Winner: Ryan Blaney (#12)',
      extraStat: 'Pole: Chase Elliott (#9) • 500 Laps',
      status: 'Completed',
      manualOverride: false,
      notes: 'Auto-synced from NASCAR Cup live telemetry feed.'
    }
  },
  {
    category: 'pga',
    item: {
      id: 'pga-live-1',
      season: '2026-27',
      date: '2026-11-15',
      event: 'Butterfield Bermuda Championship',
      venue: 'Port Royal Golf Course, Bermuda',
      winnerOrScore: 'Winner: Camilo Villegas (-19)',
      extraStat: 'FedExCup Fall • Purse: $6.9M',
      status: 'Completed',
      manualOverride: false,
      notes: 'Auto-synced from PGA Tour leaderboard API.'
    }
  },
  {
    category: 'msu_football',
    item: {
      id: 'msufb-live-1',
      season: '2026-27',
      date: '2026-11-14',
      event: 'at Illinois Fighting Illini',
      venue: 'Memorial Stadium, Champaign, IL',
      msuScore: 31,
      oppScore: 21,
      outcome: 'W',
      winnerOrScore: 'W 31–21',
      extraStat: 'Away • Big Ten',
      status: 'Completed',
      manualOverride: false,
      notes: 'Auto-synced: Spartans clinch bowl eligibility on the road!'
    }
  },
  {
    category: 'msu_basketball',
    item: {
      id: 'msubb-live-1',
      season: '2026-27',
      date: '2026-11-16',
      event: 'vs. Oakland Golden Grizzlies',
      venue: 'Breslin Center, East Lansing, MI',
      msuScore: 82,
      oppScore: 68,
      outcome: 'W',
      winnerOrScore: 'W 82–68',
      extraStat: 'Home • Non-Conference',
      status: 'Completed',
      manualOverride: false,
      notes: 'Auto-synced: 5 Spartans in double figures at Breslin.'
    }
  },
  {
    category: 'msu_hockey',
    item: {
      id: 'msuhk-live-1',
      season: '2026-27',
      date: '2026-11-14',
      event: 'vs. Ohio State Buckeyes',
      venue: 'Munn Ice Arena, East Lansing, MI',
      msuScore: 4,
      oppScore: 1,
      outcome: 'W',
      winnerOrScore: 'W 4–1',
      extraStat: 'Home • Big Ten Hockey',
      status: 'Completed',
      manualOverride: false,
      notes: 'Auto-synced: 34 saves and two power-play goals.'
    }
  }
];

const SPORT_CONFIG = {
  nascar: {
    label: 'NASCAR',
    shortLabel: 'NASCAR',
    subtitle: 'Cup Series Races, Tracks, Pole Winners, Purses & Personal Notes',
    icon: Flag,
    accent: 'text-amber-500',
    bgAccent: 'bg-amber-500/10',
    isMSU: false
  },
  pga: {
    label: 'PGA Tour',
    shortLabel: 'PGA Tour',
    subtitle: 'Majors, Tour Stops, Courses, Winning Scores & Leaderboard Notes',
    icon: Target,
    accent: 'text-emerald-500',
    bgAccent: 'bg-emerald-500/10',
    isMSU: false
  },
  msu_football: {
    label: 'MSU Football',
    shortLabel: 'MSU Football',
    subtitle: 'Michigan State Spartans Schedule, Scores, Trophy Games & W-L-T Record',
    icon: Shield,
    accent: 'text-[#18453B] dark:text-emerald-400',
    bgAccent: 'bg-[#18453B]/15',
    isMSU: true
  },
  msu_basketball: {
    label: 'MSU Basketball',
    shortLabel: 'MSU Basketball',
    subtitle: 'Michigan State Men’s Hoops, Breslin Center & Big Ten Tracker',
    icon: Trophy,
    accent: 'text-[#18453B] dark:text-emerald-400',
    bgAccent: 'bg-[#18453B]/15',
    isMSU: true
  },
  msu_hockey: {
    label: 'MSU Hockey',
    shortLabel: 'MSU Hockey',
    subtitle: 'Michigan State Ice Hockey, Munn Ice Arena & Big Ten Standings',
    icon: Shield,
    accent: 'text-[#18453B] dark:text-emerald-400',
    bgAccent: 'bg-[#18453B]/15',
    isMSU: true
  }
};

const COLLECTION_CONFIG = {
  vinyl: {
    label: 'Vinyl Records',
    singular: 'Vinyl Record',
    subtitle: 'LP Pressing Variants, Sleeve Condition, Spin Counter & Valuation',
    icon: Disc
  },
  books: {
    label: 'Books',
    singular: 'Book',
    subtitle: 'Reading Progress, Formats, Page Counts, Ratings & Reviews',
    icon: BookOpen
  },
  cards: {
    label: 'Sports Cards',
    singular: 'Sports Card',
    subtitle: 'Graded Slabs, Parallels, Purchase Cost vs. Estimated Value & ROI',
    icon: CreditCard
  },
  games: {
    label: 'Video Games',
    singular: 'Video Game',
    subtitle: 'Platforms, Completion Status, Hours Logged & Personal Ratings',
    icon: Gamepad2
  }
};

const EMPTY_CATALOG = {
  sports: { nascar: [], pga: [], msu_football: [], msu_basketball: [], msu_hockey: [] },
  collections: { vinyl: [], books: [], cards: [], games: [] }
};

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  // Firebase Auth State
  const [user, setUser] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Cloud Firestore State
  const [data, setData] = useState(EMPTY_CATALOG);
  const [cloudLoading, setCloudLoading] = useState(true);
  const [cloudStatus, setCloudStatus] = useState('syncing'); // 'synced' | 'syncing' | 'offline' | 'error'
  const [lastSyncTime, setLastSyncTime] = useState('Connecting...');

  // Search, Filter & Sort Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [seasonFilter, setSeasonFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');

  // 3-State Sports Feed Simulator: 'online' | 'slow' | 'offline'
  const [feedMode, setFeedMode] = useState('online');
  const [isSyncing, setIsSyncing] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);
  const triggerToast = (message, type = 'success', actionLabel = null, onAction = null) => {
    setToast({ id: Date.now(), message, type, actionLabel, onAction });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5500);
    return () => clearTimeout(t);
  }, [toast]);

  // Modal & Confirm Dialog States
  const [entryModal, setEntryModal] = useState({
    open: false,
    mode: 'add',
    catType: 'sport',
    catKey: 'msu_football',
    item: null
  });
  const [confirmDialog, setConfirmDialog] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    setStatusFilter('ALL');
    setSeasonFilter('ALL');
    if (SPORT_CONFIG[activeTab]) setSortBy('date_desc');
    else setSortBy('title_asc');
  }, [activeTab]);

  // ============================================================================
  // 1. FIREBASE AUTHENTICATION INITIALIZATION (RULE 3: Auth Before Queries)
  // ============================================================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth initialization notice:', err);
      } finally {
        setAuthInitialized(true);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthInitialized(true);
      if (!currentUser) {
        setData(EMPTY_CATALOG);
        setCloudLoading(false);
        setCloudStatus('offline');
      }
    });

    return () => unsubscribe();
  }, []);

  // ============================================================================
  // 2. REAL-TIME FIRESTORE SUBSCRIPTION (RULE 1 & RULE 2 Compliant)
  // ============================================================================
  useEffect(() => {
    if (!user) return;

    setCloudLoading(true);
    setCloudStatus('syncing');

    // Strict Path: /artifacts/{appId}/users/{userId}/vault_items
    const userItemsCol = collection(db, 'artifacts', appId, 'users', user.uid, 'vault_items');

    const unsubscribe = onSnapshot(
      userItemsCol,
      (snapshot) => {
        const nextSports = {
          nascar: [],
          pga: [],
          msu_football: [],
          msu_basketball: [],
          msu_hockey: []
        };
        const nextCollections = {
          vinyl: [],
          books: [],
          cards: [],
          games: []
        };

        snapshot.forEach((docSnap) => {
          const record = { ...docSnap.data(), id: docSnap.id };
          if (record.catType === 'sport' && nextSports[record.catKey]) {
            nextSports[record.catKey].push(record);
          } else if (record.catType === 'collection' && nextCollections[record.catKey]) {
            nextCollections[record.catKey].push(record);
          }
        });

        setData({ sports: nextSports, collections: nextCollections });
        setCloudLoading(false);
        setCloudStatus(snapshot.metadata.fromCache ? 'offline' : 'synced');

        const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(`Today, ${stamp}`);
      },
      (error) => {
        console.error('Firestore snapshot error:', error);
        setCloudLoading(false);
        setCloudStatus('error');
        triggerToast('Cloud sync error: Check connection or permissions.', 'error');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Helper to get strict Firestore document ref for current user
  const getUserDocRef = (docId) => {
    if (!user) return null;
    return doc(db, 'artifacts', appId, 'users', user.uid, 'vault_items', docId);
  };

  // ============================================================================
  // AGGREGATED KPI METRICS & RECORD CALCULATOR
  // ============================================================================
  const metrics = useMemo(() => {
    const computeRecord = (games) => {
      let w = 0;
      let l = 0;
      let t = 0;
      games.forEach((g) => {
        if (g.status === 'Completed') {
          if (g.outcome === 'W') w++;
          else if (g.outcome === 'L') l++;
          else if (g.outcome === 'T') t++;
        }
      });
      const total = w + l + t;
      const pct = total > 0 ? Math.round(((w + t * 0.5) / total) * 100) : 0;
      return {
        w,
        l,
        t,
        recordStr: t > 0 ? `${w}-${l}-${t}` : `${w}-${l}`,
        winPct: pct
      };
    };

    const fb = computeRecord(data.sports.msu_football);
    const bb = computeRecord(data.sports.msu_basketball);
    const hk = computeRecord(data.sports.msu_hockey);

    const spartanCumulative = {
      w: fb.w + bb.w + hk.w,
      l: fb.l + bb.l + hk.l,
      t: fb.t + bb.t + hk.t
    };
    const spartanCumulativeStr =
      spartanCumulative.t > 0
        ? `${spartanCumulative.w}-${spartanCumulative.l}-${spartanCumulative.t}`
        : `${spartanCumulative.w}-${spartanCumulative.l}`;

    const totalSportsEvents = Object.values(data.sports).reduce((acc, arr) => acc + arr.length, 0);
    const totalCollectionItems = Object.values(data.collections).reduce(
      (acc, arr) => acc + arr.length,
      0
    );
    const totalAllItems = totalSportsEvents + totalCollectionItems;

    const cardsValue = data.collections.cards.reduce((sum, c) => sum + (Number(c.value) || 0), 0);
    const cardsCost = data.collections.cards.reduce(
      (sum, c) => sum + (Number(c.purchasePrice) || 0),
      0
    );
    const vinylValue = data.collections.vinyl.reduce((sum, v) => sum + (Number(v.value) || 0), 0);
    const totalPortfolioValue = cardsValue + vinylValue;

    const upcomingEvents = Object.entries(data.sports)
      .flatMap(([key, list]) =>
        list
          .filter((i) => i.status === 'Upcoming' || i.status === 'Live')
          .map((i) => ({ ...i, sportKey: key, sportLabel: SPORT_CONFIG[key].shortLabel }))
      )
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    const recentActivity = Object.entries(data.sports)
      .flatMap(([key, list]) =>
        list
          .filter((i) => i.status === 'Completed')
          .map((i) => ({ ...i, sportKey: key, sportLabel: SPORT_CONFIG[key].shortLabel }))
      )
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 6);

    return {
      fb,
      bb,
      hk,
      spartanCumulativeStr,
      totalSportsEvents,
      totalCollectionItems,
      totalAllItems,
      cardsValue,
      cardsCost,
      vinylValue,
      totalPortfolioValue,
      upcomingEvents,
      recentActivity
    };
  }, [data]);

  // ============================================================================
  // CLOUD SEEDING (One-Click Load Starter Sample Data to Firestore)
  // ============================================================================
  const handleLoadSampleDataToCloud = async () => {
    if (!user) return;
    try {
      setCloudStatus('syncing');
      const batch = writeBatch(db);

      Object.entries(INITIAL_DATA.sports).forEach(([catKey, items]) => {
        items.forEach((item) => {
          const docId = `${catKey}-${item.id}`;
          const ref = getUserDocRef(docId);
          batch.set(ref, {
            ...item,
            id: docId,
            catType: 'sport',
            catKey,
            updatedAt: Date.now()
          });
        });
      });

      Object.entries(INITIAL_DATA.collections).forEach(([catKey, items]) => {
        items.forEach((item) => {
          const docId = `${catKey}-${item.id}`;
          const ref = getUserDocRef(docId);
          batch.set(ref, {
            ...item,
            id: docId,
            catType: 'collection',
            catKey,
            updatedAt: Date.now()
          });
        });
      });

      await batch.commit();
      triggerToast('Starter Sample Data synced to your Cloud Vault!', 'success');
    } catch (err) {
      console.error('Error seeding cloud data:', err);
      setCloudStatus('error');
      triggerToast('Failed to upload starter sample data.', 'error');
    }
  };

  // ============================================================================
  // AUTO-FETCH / LIVE SYNC ENGINE (Writes directly to Firestore)
  // ============================================================================
  const handleAutoFetch = (specificSportKey = null, forceOverwriteOverrides = false) => {
    if (isSyncing || !user) return;

    if (feedMode === 'offline') {
      const targetKey = specificSportKey || (SPORT_CONFIG[activeTab] ? activeTab : 'msu_football');
      triggerToast(
        'Auto-Fetch Failed: Sports feed is offline or unreachable. Use Manual Entry to log updates immediately.',
        'error',
        '+ Manual Entry',
        () => openAddModal('sport', targetKey)
      );
      return;
    }

    setIsSyncing(true);
    const delay = feedMode === 'slow' ? 2400 : 650;

    if (feedMode === 'slow') {
      triggerToast('Feed connection degraded — attempting slow sync (manual entry always available)...', 'info');
    }

    setTimeout(async () => {
      try {
        const updatesToApply = specificSportKey
          ? LIVE_FEED_UPDATES.filter((u) => u.category === specificSportKey)
          : LIVE_FEED_UPDATES;

        let addedCount = 0;
        let skippedOverrides = 0;
        const batch = writeBatch(db);

        updatesToApply.forEach(({ category, item }) => {
          const list = data.sports[category] || [];
          const existingIdx = list.findIndex((ex) => ex.event === item.event);

          if (existingIdx === -1) {
            const newId = `${category}-sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            const ref = getUserDocRef(newId);
            batch.set(ref, {
              ...item,
              id: newId,
              catType: 'sport',
              catKey: category,
              updatedAt: Date.now()
            });
            addedCount++;
          } else if (list[existingIdx].manualOverride && !forceOverwriteOverrides) {
            skippedOverrides++;
          }
        });

        if (addedCount > 0) {
          setCloudStatus('syncing');
          await batch.commit();
        }

        setIsSyncing(false);

        if (addedCount > 0) {
          triggerToast(
            `Cloud Synced ${addedCount} new result${addedCount > 1 ? 's' : ''}${
              skippedOverrides > 0 ? ` (${skippedOverrides} manual override protected)` : ''
            }.`,
            'success'
          );
        } else if (skippedOverrides > 0) {
          triggerToast(
            `Feed checked: ${skippedOverrides} Manual Override item(s) preserved in Cloud.`,
            'info'
          );
        } else {
          triggerToast('Feed up to date — no new unlogged events found.', 'info');
        }
      } catch (err) {
        setIsSyncing(false);
        triggerToast('Error writing synced events to Cloud.', 'error');
      }
    }, delay);
  };

  // ============================================================================
  // CLOUD CRUD HANDLERS & QUICK ACTIONS
  // ============================================================================
  const openAddModal = (catType, catKey) => {
    setEntryModal({ open: true, mode: 'add', catType, catKey, item: null });
  };

  const openEditModal = (catType, catKey, item) => {
    setEntryModal({ open: true, mode: 'edit', catType, catKey, item });
  };

  const handleSaveEntry = async (catType, catKey, payload) => {
    if (!user) {
      triggerToast('Please sign in to save items to your Cloud Vault.', 'error');
      return;
    }

    try {
      setCloudStatus('syncing');
      const docId =
        entryModal.mode === 'add'
          ? `${catKey}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
          : entryModal.item.id;

      const docRef = getUserDocRef(docId);
      const recordToSave = {
        ...payload,
        id: docId,
        catType,
        catKey,
        ...(catType === 'sport' ? { manualOverride: true } : {}),
        updatedAt: Date.now()
      };

      await setDoc(docRef, recordToSave, { merge: true });

      if (catType === 'sport') {
        triggerToast(
          entryModal.mode === 'add'
            ? `Saved manual entry to ${SPORT_CONFIG[catKey].label} in Cloud.`
            : `Saved Manual Override for ${SPORT_CONFIG[catKey].label}.`,
          'success'
        );
      } else {
        triggerToast(
          entryModal.mode === 'add'
            ? `Added ${COLLECTION_CONFIG[catKey].singular} to Cloud Vault.`
            : `Updated ${COLLECTION_CONFIG[catKey].singular} in Cloud.`,
          'success'
        );
      }
      setEntryModal((prev) => ({ ...prev, open: false }));
    } catch (err) {
      console.error('Firestore save error:', err);
      setCloudStatus('error');
      triggerToast('Failed to save item to Cloud Firestore.', 'error');
    }
  };

  const handleIncrementSpin = async (vinylItem) => {
    if (!user) return;
    try {
      setCloudStatus('syncing');
      const ref = getUserDocRef(vinylItem.id);
      await updateDoc(ref, {
        spinCount: (Number(vinylItem.spinCount) || 0) + 1,
        updatedAt: Date.now()
      });
      triggerToast('+1 Spin synced to Cloud!', 'success');
    } catch (err) {
      console.error('Spin update error:', err);
      triggerToast('Failed to update spin count in Cloud.', 'error');
    }
  };

  const requestDelete = (catType, catKey, item) => {
    const label = catType === 'sport' ? item.event : item.title || item.player;
    setConfirmDialog({
      title: 'Confirm Cloud Deletion',
      message: `Permanently delete "${label}" from your Cloud Vault across all devices?`,
      confirmText: 'Delete',
      danger: true,
      onConfirm: async () => {
        if (!user) return;
        try {
          setCloudStatus('syncing');
          await deleteDoc(getUserDocRef(item.id));
          setConfirmDialog(null);
          triggerToast(`Deleted "${label}" from Cloud.`, 'info');
        } catch (err) {
          console.error('Delete error:', err);
          triggerToast('Failed to delete item from Cloud.', 'error');
        }
      }
    });
  };

  const requestClearAllData = () => {
    setConfirmDialog({
      title: 'Clear All Cloud Catalog Data',
      message:
        'Wipe all entries across all 9 categories in your Cloud Vault? Export a JSON backup first if you want to keep a copy.',
      confirmText: 'Clear Cloud Vault',
      danger: true,
      onConfirm: async () => {
        if (!user) return;
        try {
          setCloudStatus('syncing');
          const batch = writeBatch(db);
          Object.values(data.sports).forEach((list) => {
            list.forEach((item) => batch.delete(getUserDocRef(item.id)));
          });
          Object.values(data.collections).forEach((list) => {
            list.forEach((item) => batch.delete(getUserDocRef(item.id)));
          });
          await batch.commit();
          setConfirmDialog(null);
          triggerToast('All Cloud Vault data cleared.', 'info');
        } catch (err) {
          console.error('Batch clear error:', err);
          triggerToast('Failed to clear Cloud data.', 'error');
        }
      }
    });
  };

  // ============================================================================
  // JSON EXPORT & BATCH FIRESTORE IMPORT
  // ============================================================================
  const handleExportJSON = () => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-vault-arena-cloud-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast('Cloud catalog downloaded as JSON backup.', 'success');
    } catch (err) {
      triggerToast('Failed to export JSON backup.', 'error');
    }
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed?.sports && parsed?.collections) {
          setCloudStatus('syncing');
          const batch = writeBatch(db);
          let count = 0;

          Object.entries(parsed.sports).forEach(([catKey, items]) => {
            if (!SPORT_CONFIG[catKey] || !Array.isArray(items)) return;
            items.forEach((item) => {
              const docId = item.id || `${catKey}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
              batch.set(
                getUserDocRef(docId),
                { ...item, id: docId, catType: 'sport', catKey, updatedAt: Date.now() },
                { merge: true }
              );
              count++;
            });
          });

          Object.entries(parsed.collections).forEach(([catKey, items]) => {
            if (!COLLECTION_CONFIG[catKey] || !Array.isArray(items)) return;
            items.forEach((item) => {
              const docId = item.id || `${catKey}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
              batch.set(
                getUserDocRef(docId),
                { ...item, id: docId, catType: 'collection', catKey, updatedAt: Date.now() },
                { merge: true }
              );
              count++;
            });
          });

          await batch.commit();
          triggerToast(`Batch-imported ${count} items to Cloud Firestore!`, 'success');
        } else {
          triggerToast('Invalid JSON backup schema.', 'error');
        }
      } catch (err) {
        console.error('Import error:', err);
        triggerToast('Could not parse or upload JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ============================================================================
  // FILTERED & SORTED VIEW ITEMS
  // ============================================================================
  const availableSeasons = useMemo(() => {
    if (!SPORT_CONFIG[activeTab]) return [];
    const set = new Set(
      (data.sports[activeTab] || []).map((i) => i.season).filter(Boolean)
    );
    return ['ALL', ...Array.from(set)];
  }, [data, activeTab]);

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (SPORT_CONFIG[activeTab]) {
      let list = [...(data.sports[activeTab] || [])];
      if (q) {
        list = list.filter((item) =>
          [item.event, item.venue, item.winnerOrScore, item.extraStat, item.notes]
            .filter(Boolean)
            .some((val) => val.toLowerCase().includes(q))
        );
      }
      if (seasonFilter !== 'ALL') {
        list = list.filter((i) => i.season === seasonFilter);
      }
      if (statusFilter !== 'ALL') {
        if (['W', 'L', 'T'].includes(statusFilter)) {
          list = list.filter((i) => i.outcome === statusFilter);
        } else if (statusFilter === 'OVERRIDE') {
          list = list.filter((i) => i.manualOverride);
        } else {
          list = list.filter((i) => i.status === statusFilter);
        }
      }
      list.sort((a, b) => {
        if (sortBy === 'date_desc') return (b.date || '').localeCompare(a.date || '');
        if (sortBy === 'date_asc') return (a.date || '').localeCompare(b.date || '');
        return (a.event || '').localeCompare(b.event || '');
      });
      return list;
    }

    if (COLLECTION_CONFIG[activeTab]) {
      let list = [...(data.collections[activeTab] || [])];
      if (q) {
        list = list.filter((item) =>
          Object.values(item).some((v) => String(v).toLowerCase().includes(q))
        );
      }
      if (statusFilter !== 'ALL') {
        if (activeTab === 'vinyl') list = list.filter((i) => i.condition === statusFilter);
        if (activeTab === 'books') list = list.filter((i) => i.status === statusFilter);
        if (activeTab === 'cards') {
          list = list.filter((i) =>
            statusFilter === 'GRADED' ? i.grading !== 'Raw' : i.grading === 'Raw'
          );
        }
        if (activeTab === 'games') list = list.filter((i) => i.status === statusFilter);
      }
      list.sort((a, b) => {
        if (sortBy === 'title_asc') return (a.title || a.player || '').localeCompare(b.title || b.player || '');
        if (sortBy === 'value_desc') return (Number(b.value) || 0) - (Number(a.value) || 0);
        if (sortBy === 'rating_desc') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        if (sortBy === 'spins_desc') return (Number(b.spinCount) || 0) - (Number(a.spinCount) || 0);
        if (sortBy === 'hours_desc') return (Number(b.hoursPlayed) || 0) - (Number(a.hoursPlayed) || 0);
        return 0;
      });
      return list;
    }

    return [];
  }, [data, activeTab, searchQuery, statusFilter, seasonFilter, sortBy]);

  // Global search results on Overview
  const globalMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || activeTab !== 'overview') return [];
    const matches = [];
    Object.entries(data.sports).forEach(([key, list]) => {
      list.forEach((item) => {
        if (
          [item.event, item.venue, item.winnerOrScore, item.notes]
            .filter(Boolean)
            .some((v) => v.toLowerCase().includes(q))
        ) {
          matches.push({
            catKey: key,
            catLabel: SPORT_CONFIG[key].label,
            title: item.event,
            sub: `${item.date} • ${item.venue}`,
            badge: item.winnerOrScore
          });
        }
      });
    });
    Object.entries(data.collections).forEach(([key, list]) => {
      list.forEach((item) => {
        if (Object.values(item).some((v) => String(v).toLowerCase().includes(q))) {
          matches.push({
            catKey: key,
            catLabel: COLLECTION_CONFIG[key].label,
            title: item.title || item.player,
            sub: item.artist || item.author || item.yearSet || item.platform || '',
            badge: item.status || item.grading || item.condition || ''
          });
        }
      });
    });
    return matches;
  }, [data, searchQuery, activeTab]);

  const renderStars = (count) => {
    const n = Number(count) || 0;
    if (n === 0) return <span className="text-xs text-slate-400">Unrated</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= n ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  // ============================================================================
  // AUTH GATE SCREEN (If user explicitly signed out)
  // ============================================================================
  if (authInitialized && !user) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <AuthScreen
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onSuccess={(msg) => triggerToast(msg, 'success')}
          onError={(msg) => triggerToast(msg, 'error')}
        />
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-200 font-sans">
        {/* ================================================================== */}
        {/* MOBILE DRAWER BACKDROP                                             */}
        {/* ================================================================== */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* ================================================================== */}
        {/* SIDEBAR NAVIGATION                                                 */}
        {/* ================================================================== */}
        <aside
          className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Logo & Brand */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#18453B] text-white flex items-center justify-center shadow-md shadow-[#18453B]/30 border border-emerald-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                  My Vault & Arena
                </h1>
                <p className="text-[11px] font-semibold text-[#18453B] dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> Cloud Synced Hub
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            <div>
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#18453B] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <span className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard Overview
                </span>
              </button>
            </div>

            {/* Sports Arena Group */}
            <div>
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Sports Arena (5)
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    feedMode === 'offline'
                      ? 'bg-rose-500/15 text-rose-500'
                      : feedMode === 'slow'
                      ? 'bg-amber-500/15 text-amber-500'
                      : 'bg-emerald-500/15 text-emerald-500'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      feedMode === 'offline'
                        ? 'bg-rose-500'
                        : feedMode === 'slow'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500 animate-pulse'
                    }`}
                  />
                  {feedMode === 'offline' ? 'Manual' : feedMode === 'slow' ? 'Slow' : 'Live'}
                </span>
              </div>
              <div className="space-y-1">
                {Object.entries(SPORT_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const count = data.sports[key]?.length || 0;
                  const active = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveTab(key);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-[#18453B] text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <span className="flex items-center gap-3 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-300' : cfg.accent}`} />
                        <span className="truncate">{cfg.label}</span>
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personal Vault Group */}
            <div>
              <div className="px-3 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Personal Vault (4)
                </span>
              </div>
              <div className="space-y-1">
                {Object.entries(COLLECTION_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const count = data.collections[key]?.length || 0;
                  const active = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveTab(key);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-[#18453B] text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <span className="flex items-center gap-3 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-300' : 'text-slate-400'}`} />
                        <span className="truncate">{cfg.label}</span>
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Sidebar Cloud Account & Data Management Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5 bg-slate-50/70 dark:bg-slate-900/90">
            {/* Signed-In User Account Card */}
            {user && (
              <div
                onClick={() => setAccountModalOpen(true)}
                className="cursor-pointer p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold truncate">
                      {user.isAnonymous ? 'Guest Cloud Session' : user.email || 'Cloud Account'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                    UID: {user.uid}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 shrink-0">
                  Account
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#18453B] dark:hover:border-emerald-500 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                Export JSON
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#18453B] dark:hover:border-emerald-500 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                Import JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadSampleDataToCloud}
                  className="text-slate-500 hover:text-emerald-500 transition-colors"
                >
                  Load Samples
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  onClick={requestClearAllData}
                  className="text-slate-500 hover:text-rose-500 transition-colors"
                >
                  Clear Cloud
                </button>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                {darkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3" />}
                {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </aside>

        {/* ================================================================== */}
        {/* RIGHT MAIN CONTENT AREA                                            */}
        {/* ================================================================== */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar: Search + Cloud Sync Pill + 3-State Feed Engine + Auto-Fetch */}
          <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              {/* Mobile Nav + Search */}
              <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-lg">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      activeTab === 'overview'
                        ? 'Global search across all 9 cloud trackers...'
                        : `Search in ${
                            SPORT_CONFIG[activeTab]?.label || COLLECTION_CONFIG[activeTab]?.label
                          }...`
                    }
                    className="w-full pl-10 pr-8 py-2 rounded-xl text-sm bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-[#18453B] dark:focus:border-emerald-500 outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Controls: Live Cloud Sync Status, Feed Mode, Sync Button, Account */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Real-Time Cloud Sync Status Indicator */}
                <button
                  onClick={() => setAccountModalOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    cloudStatus === 'synced'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                      : cloudStatus === 'syncing'
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300'
                  }`}
                  title="Click to manage Cloud Account & cross-device sync"
                >
                  {cloudStatus === 'synced' ? (
                    <>
                      <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="hidden md:inline">Synced to Cloud</span>
                    </>
                  ) : cloudStatus === 'syncing' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-500" />
                      <span className="hidden md:inline">Syncing...</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                      <span className="hidden md:inline">Offline / Pending</span>
                    </>
                  )}
                </button>

                {/* 3-State Sports Feed Mode Selector */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => {
                      setFeedMode('online');
                      triggerToast('Sports Feed Status: Online / Fast', 'success');
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      feedMode === 'online'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="Simulate healthy live sports API"
                  >
                    <Wifi className="w-3 h-3" />
                    <span className="hidden sm:inline">Online</span>
                  </button>
                  <button
                    onClick={() => {
                      setFeedMode('slow');
                      triggerToast('Sports Feed Status: Slow / Degraded (2.4s latency)', 'info');
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      feedMode === 'slow'
                        ? 'bg-amber-500 text-slate-950 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="Simulate slow/lagging API response"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span className="hidden sm:inline">Slow</span>
                  </button>
                  <button
                    onClick={() => {
                      setFeedMode('offline');
                      triggerToast('Sports Feed Status: Offline / Manual Mode active', 'error');
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      feedMode === 'offline'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="Simulate broken/offline API to test Manual Entry fallback"
                  >
                    <WifiOff className="w-3 h-3" />
                    <span className="hidden sm:inline">Offline</span>
                  </button>
                </div>

                {/* Auto-Fetch Button */}
                <button
                  onClick={() => handleAutoFetch(SPORT_CONFIG[activeTab] ? activeTab : null)}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#18453B] hover:bg-[#1f574b] text-white shadow-xs transition-all disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Auto-Fetch'}</span>
                </button>

                {/* Step-by-Step Guide Trigger */}
                <button
                  onClick={() => setGuideModalOpen(true)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-[#18453B]"
                  title="Cloud & Usage Guide"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Main Workspace */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
            {/* Initial Cloud Loading Skeleton */}
            {cloudLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                <p className="font-bold text-base">Connecting to your Cloud Vault...</p>
                <p className="text-xs text-slate-500 mt-1">
                  Syncing real-time records from Firestore
                </p>
              </div>
            ) : (
              <>
                {/* ============================================================== */}
                {/* 1. OVERVIEW DASHBOARD                                          */}
                {/* ============================================================== */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Empty Cloud Vault Onboarding Banner */}
                    {metrics.totalAllItems === 0 && (
                      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-extrabold text-base text-amber-700 dark:text-amber-300 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Your Cloud Vault is Empty
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                            Want to explore with pre-built NASCAR, PGA, MSU Spartans, Vinyl, Books, Cards, and Games examples? Load the starter dataset into your cloud account in one click.
                          </p>
                        </div>
                        <button
                          onClick={handleLoadSampleDataToCloud}
                          className="px-4 py-2.5 rounded-xl bg-[#18453B] hover:bg-[#1f574b] text-white font-bold text-sm shadow-sm shrink-0"
                        >
                          Load Starter Sample Data
                        </button>
                      </div>
                    )}

                    {/* Spartan Command Banner */}
                    <div className="rounded-2xl bg-gradient-to-br from-[#18453B] via-[#133830] to-slate-900 text-white p-6 sm:p-8 shadow-lg border border-emerald-500/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-3">
                          <Cloud className="w-3.5 h-3.5" />
                          Cloud Synced: {lastSyncTime} • Feed Mode: {feedMode.toUpperCase()}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                          My Vault & Arena Command Center
                        </h2>
                        <p className="text-emerald-100/80 text-sm sm:text-base mt-1.5 max-w-2xl">
                          Real-time cloud-synced tracking for NASCAR, PGA Tour, Michigan State Athletics, Vinyl Records, Books, Sports Cards, and Video Games across all your devices.
                        </p>
                      </div>

                      {/* Quick-Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <button
                          onClick={() => openAddModal('sport', 'msu_football')}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#18453B] font-bold text-sm hover:bg-emerald-50 shadow-sm transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Game / Race
                        </button>
                        <button
                          onClick={() => openAddModal('collection', 'cards')}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-white font-bold text-sm transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Collectible
                        </button>
                      </div>
                    </div>

                    {/* Global Search Instant Results */}
                    {searchQuery.trim() !== '' && (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">
                            Global Cloud Search Matches ({globalMatches.length})
                          </h3>
                          <button
                            onClick={() => setSearchQuery('')}
                            className="text-xs font-semibold text-emerald-500 hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                        {globalMatches.length === 0 ? (
                          <p className="text-sm text-slate-500 py-4 text-center">
                            No matches for "{searchQuery}".
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {globalMatches.map((m, i) => (
                              <div
                                key={i}
                                onClick={() => setActiveTab(m.catKey)}
                                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 cursor-pointer flex items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold uppercase text-emerald-500">
                                    {m.catLabel}
                                  </span>
                                  <p className="font-bold text-sm truncate">{m.title}</p>
                                  <p className="text-xs text-slate-500 truncate">{m.sub}</p>
                                </div>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                                  {m.badge}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4 Top-Level Summary KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Total Tracked Events
                          </span>
                          <Flag className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-3xl font-extrabold mt-2">{metrics.totalSportsEvents}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Across NASCAR, PGA & MSU Athletics
                        </p>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Spartan Cumulative Record
                          </span>
                          <Shield className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-extrabold mt-2 text-emerald-600 dark:text-emerald-400">
                          {metrics.spartanCumulativeStr}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          FB {metrics.fb.recordStr} • BB {metrics.bb.recordStr} • HK {metrics.hk.recordStr}
                        </p>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Total Vault Items
                          </span>
                          <Layers className="w-4 h-4 text-sky-500" />
                        </div>
                        <p className="text-3xl font-extrabold mt-2">{metrics.totalCollectionItems}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Vinyl, Books, Cards & Video Games
                        </p>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Est. Portfolio Value
                          </span>
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-extrabold mt-2 text-emerald-600 dark:text-emerald-400">
                          ${metrics.totalPortfolioValue.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Cards (${metrics.cardsValue.toLocaleString()}) + Vinyl (${metrics.vinylValue.toLocaleString()})
                        </p>
                      </div>
                    </div>

                    {/* All 9 Category Quick-Jump Cards */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Quick Access — All 9 Interests & Collections
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {[
                          {
                            key: 'msu_football',
                            title: 'MSU Football',
                            stat: `Record: ${metrics.fb.recordStr} (${metrics.fb.winPct}%)`,
                            sub: `${data.sports.msu_football.length} games tracked`,
                            icon: Shield,
                            color: 'text-emerald-500'
                          },
                          {
                            key: 'msu_basketball',
                            title: 'MSU Basketball',
                            stat: `Record: ${metrics.bb.recordStr} (${metrics.bb.winPct}%)`,
                            sub: `${data.sports.msu_basketball.length} games tracked`,
                            icon: Trophy,
                            color: 'text-emerald-500'
                          },
                          {
                            key: 'msu_hockey',
                            title: 'MSU Hockey',
                            stat: `Record: ${metrics.hk.recordStr} (${metrics.hk.winPct}%)`,
                            sub: `${data.sports.msu_hockey.length} games tracked`,
                            icon: Shield,
                            color: 'text-emerald-500'
                          },
                          {
                            key: 'nascar',
                            title: 'NASCAR Cup Series',
                            stat: `${data.sports.nascar.length} Races`,
                            sub: 'Tracks, winners & watch notes',
                            icon: Flag,
                            color: 'text-amber-500'
                          },
                          {
                            key: 'pga',
                            title: 'PGA Tour',
                            stat: `${data.sports.pga.length} Tournaments`,
                            sub: 'Majors & leaderboard tracker',
                            icon: Target,
                            color: 'text-emerald-500'
                          },
                          {
                            key: 'vinyl',
                            title: 'Vinyl Records',
                            stat: `${data.collections.vinyl.length} LPs ($${metrics.vinylValue})`,
                            sub: `${data.collections.vinyl.reduce((s, v) => s + (v.spinCount || 0), 0)} total spins logged`,
                            icon: Disc,
                            color: 'text-purple-500'
                          },
                          {
                            key: 'books',
                            title: 'Books Library',
                            stat: `${data.collections.books.length} Books`,
                            sub: `${data.collections.books.filter((b) => b.status === 'Completed').length} completed`,
                            icon: BookOpen,
                            color: 'text-sky-500'
                          },
                          {
                            key: 'cards',
                            title: 'Sports Cards',
                            stat: `${data.collections.cards.length} Cards ($${metrics.cardsValue})`,
                            sub: `Net P/L: ${metrics.cardsValue - metrics.cardsCost >= 0 ? '+' : ''}$${
                              metrics.cardsValue - metrics.cardsCost
                            }`,
                            icon: CreditCard,
                            color: 'text-emerald-500'
                          },
                          {
                            key: 'games',
                            title: 'Video Games',
                            stat: `${data.collections.games.length} Games`,
                            sub: `${data.collections.games.reduce((s, g) => s + (g.hoursPlayed || 0), 0)} hrs played`,
                            icon: Gamepad2,
                            color: 'text-rose-500'
                          }
                        ].map((card) => {
                          const Icon = card.icon;
                          return (
                            <div
                              key={card.key}
                              onClick={() => setActiveTab(card.key)}
                              className="cursor-pointer group bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 hover:border-[#18453B] dark:hover:border-emerald-500 transition-all flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                  <Icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                    {card.title}
                                  </p>
                                  <p className="text-xs font-semibold text-[#18453B] dark:text-emerald-400 truncate">
                                    {card.stat}
                                  </p>
                                  <p className="text-[11px] text-slate-500 truncate">{card.sub}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recent Activity & Upcoming Events Feed */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Upcoming Schedule */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-base flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            Upcoming Events & Live Watchlist
                          </h3>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300">
                            {metrics.upcomingEvents.length} Upcoming
                          </span>
                        </div>
                        {metrics.upcomingEvents.length === 0 ? (
                          <p className="text-sm text-slate-500 py-6 text-center">
                            No upcoming events scheduled.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {metrics.upcomingEvents.map((ev) => (
                              <div
                                key={ev.id}
                                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                              >
                                <div
                                  onClick={() => setActiveTab(ev.sportKey)}
                                  className="min-w-0 cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#18453B]/15 text-[#18453B] dark:text-emerald-400">
                                      {ev.sportLabel}
                                    </span>
                                    <span className="text-xs text-slate-500">{ev.date}</span>
                                  </div>
                                  <p className="font-bold text-sm mt-1 truncate">{ev.event}</p>
                                  <p className="text-xs text-slate-500 truncate">{ev.venue}</p>
                                </div>
                                <button
                                  onClick={() => openEditModal('sport', ev.sportKey, ev)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#18453B] text-white hover:bg-[#1f574b] shrink-0"
                                >
                                  Log Result
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Recent Completed Results */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-base flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Recent Arena Results
                          </h3>
                          <span className="text-xs text-slate-400">Latest Completed</span>
                        </div>
                        {metrics.recentActivity.length === 0 ? (
                          <p className="text-sm text-slate-500 py-6 text-center">
                            No completed events logged yet.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {metrics.recentActivity.map((ev) => (
                              <div
                                key={ev.id}
                                onClick={() => setActiveTab(ev.sportKey)}
                                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                      {ev.sportLabel}
                                    </span>
                                    <span className="text-xs text-slate-500">{ev.date}</span>
                                    {ev.manualOverride && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500">
                                        <Lock className="w-2.5 h-2.5" /> Override
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-bold text-sm mt-1 truncate">{ev.event}</p>
                                </div>
                                <span
                                  className={`text-xs font-extrabold px-2.5 py-1 rounded-lg shrink-0 ${
                                    ev.outcome === 'L'
                                      ? 'bg-rose-500/15 text-rose-500'
                                      : ev.outcome === 'T'
                                      ? 'bg-amber-500/15 text-amber-500'
                                      : 'bg-emerald-500/15 text-emerald-500'
                                  }`}
                                >
                                  {ev.winnerOrScore}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* 2. SPORTS ARENA SUB-VIEWS (NASCAR, PGA, MSU FB/BB/HK)          */}
                {/* ============================================================== */}
                {SPORT_CONFIG[activeTab] && (
                  <div className="space-y-6">
                    {/* Sport Header Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl ${SPORT_CONFIG[activeTab].bgAccent} flex items-center justify-center shrink-0`}
                        >
                          {React.createElement(SPORT_CONFIG[activeTab].icon, {
                            className: `w-6 h-6 ${SPORT_CONFIG[activeTab].accent}`
                          })}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-2xl font-extrabold tracking-tight">
                              {SPORT_CONFIG[activeTab].label}
                            </h2>
                            {SPORT_CONFIG[activeTab].isMSU && (() => {
                              const rec =
                                activeTab === 'msu_football'
                                  ? metrics.fb
                                  : activeTab === 'msu_basketball'
                                  ? metrics.bb
                                  : metrics.hk;
                              return (
                                <div className="flex items-center gap-2">
                                  <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-[#18453B] text-white">
                                    Record: {rec.recordStr}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                                    {rec.winPct}% Win
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {SPORT_CONFIG[activeTab].subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Manual Entry / Override CTA */}
                      <button
                        onClick={() => openAddModal('sport', activeTab)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18453B] hover:bg-[#1f574b] text-white font-bold text-sm shadow-md shadow-[#18453B]/20 transition-all shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        Manual Entry / Override
                      </button>
                    </div>

                    {/* Degraded / Offline Feed Alert Banner */}
                    {feedMode !== 'online' && (
                      <div
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm ${
                          feedMode === 'offline'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-200'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {feedMode === 'offline' ? (
                            <WifiOff className="w-4 h-4 text-rose-500 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <span>
                            {feedMode === 'offline' ? (
                              <>
                                <strong>Offline / Manual Mode:</strong> Automatic sports data sync is disabled. Add or override scores directly to your Cloud Vault below.
                              </>
                            ) : (
                              <>
                                <strong>Slow / Degraded Feed:</strong> External sports API is responding slowly. Manual entries are protected with a lock badge.
                              </>
                            )}
                          </span>
                        </div>
                        <button
                          onClick={() => openAddModal('sport', activeTab)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shrink-0"
                        >
                          + Log Manually
                        </button>
                      </div>
                    )}

                    {/* Season Filter, Status Filter & Sort Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-4 h-4 text-slate-400 mr-1" />
                        {[
                          'ALL',
                          'Completed',
                          'Live',
                          'Upcoming',
                          ...(SPORT_CONFIG[activeTab].isMSU ? ['W', 'L', 'T'] : []),
                          'OVERRIDE'
                        ].map((st) => (
                          <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              statusFilter === st
                                ? 'bg-[#18453B] text-white'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {st === 'ALL'
                              ? 'All'
                              : st === 'OVERRIDE'
                              ? 'Manual Overrides'
                              : st}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Season Filter */}
                        <select
                          value={seasonFilter}
                          onChange={(e) => setSeasonFilter(e.target.value)}
                          className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 outline-none"
                        >
                          {availableSeasons.map((s) => (
                            <option key={s} value={s}>
                              {s === 'ALL' ? 'Season: All' : `Season: ${s}`}
                            </option>
                          ))}
                        </select>

                        {/* Sort */}
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 outline-none"
                        >
                          <option value="date_desc">Newest First</option>
                          <option value="date_asc">Oldest First</option>
                          <option value="title_asc">Event A–Z</option>
                        </select>
                      </div>
                    </div>

                    {/* Sport Events List */}
                    {filteredList.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                        <p className="font-bold text-base">No matching events found</p>
                        <p className="text-sm text-slate-500 mt-1 mb-4">
                          Adjust your filters or add a new event to your Cloud Vault.
                        </p>
                        <button
                          onClick={() => openAddModal('sport', activeTab)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18453B] text-white text-sm font-bold"
                        >
                          <Plus className="w-4 h-4" />
                          Add Event
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {filteredList.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#18453B]/60 dark:hover:border-emerald-500/50 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                          >
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Status Pill */}
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    item.status === 'Live'
                                      ? 'bg-rose-500/15 text-rose-500 animate-pulse'
                                      : item.status === 'Completed'
                                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                                  }`}
                                >
                                  {item.status}
                                </span>

                                {/* Season & Date */}
                                {item.season && (
                                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {item.season}
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {item.date}
                                </span>

                                {/* Manual Override Lock Badge */}
                                {item.manualOverride && (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                                    title="Manually entered or edited — protected from auto-sync overwrite"
                                  >
                                    <Lock className="w-3 h-3" />
                                    Manual Override
                                  </span>
                                )}
                              </div>

                              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                                {item.event}
                              </h3>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {item.venue}
                                </span>
                                {item.extraStat && (
                                  <span className="text-slate-400">• {item.extraStat}</span>
                                )}
                              </div>

                              {item.notes && (
                                <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/70 rounded-xl px-3.5 py-2.5 border border-slate-100 dark:border-slate-800 mt-2">
                                  {item.notes}
                                </p>
                              )}
                            </div>

                            {/* Right Result & Override Controls */}
                            <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                              <div
                                className={`px-3.5 py-1.5 rounded-xl text-sm font-extrabold ${
                                  item.status === 'Upcoming'
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    : item.outcome === 'L'
                                    ? 'bg-rose-500/15 text-rose-500 border border-rose-500/20'
                                    : item.outcome === 'T'
                                    ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                                    : item.outcome === 'W'
                                    ? 'bg-[#18453B] text-white'
                                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                                }`}
                              >
                                {item.winnerOrScore || 'TBD'}
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => openEditModal('sport', activeTab, item)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  Edit / Override
                                </button>
                                <button
                                  onClick={() => requestDelete('sport', activeTab, item)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ============================================================== */}
                {/* 3. PERSONAL VAULT SUB-VIEWS (Vinyl, Books, Cards, Video Games) */}
                {/* ============================================================== */}
                {COLLECTION_CONFIG[activeTab] && (
                  <div className="space-y-6">
                    {/* Collection Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#18453B]/15 text-[#18453B] dark:text-emerald-400 flex items-center justify-center shrink-0">
                          {React.createElement(COLLECTION_CONFIG[activeTab].icon, {
                            className: 'w-6 h-6'
                          })}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-2xl font-extrabold tracking-tight">
                              {COLLECTION_CONFIG[activeTab].label}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800">
                              {data.collections[activeTab].length} Items
                            </span>
                            {activeTab === 'cards' && (
                              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                                Value: ${metrics.cardsValue.toLocaleString()} (Net{' '}
                                {metrics.cardsValue - metrics.cardsCost >= 0 ? '+' : ''}$
                                {(metrics.cardsValue - metrics.cardsCost).toLocaleString()})
                              </span>
                            )}
                            {activeTab === 'vinyl' && (
                              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-purple-500/15 text-purple-600 dark:text-purple-300">
                                Est. Value: ${metrics.vinylValue.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {COLLECTION_CONFIG[activeTab].subtitle}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => openAddModal('collection', activeTab)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18453B] hover:bg-[#1f574b] text-white font-bold text-sm shadow-md shadow-[#18453B]/20 shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        Add {COLLECTION_CONFIG[activeTab].singular}
                      </button>
                    </div>

                    {/* Filter & Sort Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-4 h-4 text-slate-400 mr-1" />
                        {activeTab === 'vinyl' &&
                          ['ALL', 'Mint', 'NM', 'VG+', 'VG'].map((c) => (
                            <button
                              key={c}
                              onClick={() => setStatusFilter(c)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                statusFilter === c
                                  ? 'bg-[#18453B] text-white'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {c === 'ALL' ? 'All Conditions' : c}
                            </button>
                          ))}
                        {activeTab === 'books' &&
                          ['ALL', 'Reading', 'Completed', 'TBR/Wishlist'].map((s) => (
                            <button
                              key={s}
                              onClick={() => setStatusFilter(s)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                statusFilter === s
                                  ? 'bg-[#18453B] text-white'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {s === 'ALL' ? 'All Books' : s}
                            </button>
                          ))}
                        {activeTab === 'cards' &&
                          [
                            { id: 'ALL', label: 'All Cards' },
                            { id: 'GRADED', label: 'Graded Slabs' },
                            { id: 'RAW', label: 'Raw' }
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setStatusFilter(opt.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                statusFilter === opt.id
                                  ? 'bg-[#18453B] text-white'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        {activeTab === 'games' &&
                          ['ALL', 'Playing', 'Completed', 'Backlog', '100%'].map((s) => (
                            <button
                              key={s}
                              onClick={() => setStatusFilter(s)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                statusFilter === s
                                  ? 'bg-[#18453B] text-white'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {s === 'ALL' ? 'All Games' : s}
                            </button>
                          ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 outline-none"
                        >
                          <option value="title_asc">Name / Title (A–Z)</option>
                          {(activeTab === 'vinyl' || activeTab === 'cards') && (
                            <option value="value_desc">Est. Value: High to Low</option>
                          )}
                          {activeTab === 'vinyl' && (
                            <option value="spins_desc">Spin Count: Most Played</option>
                          )}
                          {(activeTab === 'books' || activeTab === 'games') && (
                            <option value="rating_desc">Rating: Highest</option>
                          )}
                          {activeTab === 'games' && (
                            <option value="hours_desc">Hours Played: Most</option>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Collection Item Cards */}
                    {filteredList.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                        <p className="font-bold text-base">No items in this view</p>
                        <p className="text-sm text-slate-500 mt-1 mb-4">
                          Click below to catalog your first {COLLECTION_CONFIG[activeTab].singular} in the cloud.
                        </p>
                        <button
                          onClick={() => openAddModal('collection', activeTab)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18453B] text-white text-sm font-bold"
                        >
                          <Plus className="w-4 h-4" />
                          Add {COLLECTION_CONFIG[activeTab].singular}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredList.map((item) => {
                          const profitLoss =
                            activeTab === 'cards'
                              ? (Number(item.value) || 0) - (Number(item.purchasePrice) || 0)
                              : 0;

                          return (
                            <div
                              key={item.id}
                              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#18453B]/70 dark:hover:border-emerald-500/60 p-5 flex flex-col justify-between transition-all"
                            >
                              <div>
                                {/* Top Badge Row */}
                                <div className="flex items-center justify-between gap-2 mb-3">
                                  {activeTab === 'vinyl' && (
                                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300">
                                      {item.condition} • ${Number(item.value || 0)}
                                    </span>
                                  )}
                                  {activeTab === 'books' && (
                                    <span
                                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                                        item.status === 'Completed'
                                          ? 'bg-emerald-500/15 text-emerald-500'
                                          : item.status === 'Reading'
                                          ? 'bg-sky-500/15 text-sky-500'
                                          : 'bg-amber-500/15 text-amber-500'
                                      }`}
                                    >
                                      {item.status}
                                    </span>
                                  )}
                                  {activeTab === 'cards' && (
                                    <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-300">
                                      {item.grading}
                                    </span>
                                  )}
                                  {activeTab === 'games' && (
                                    <span
                                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                                        item.status === '100%' || item.status === 'Completed'
                                          ? 'bg-emerald-500/15 text-emerald-500'
                                          : item.status === 'Playing'
                                          ? 'bg-sky-500/15 text-sky-500'
                                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                      }`}
                                    >
                                      {item.status}
                                    </span>
                                  )}

                                  {/* Right Side Top Indicator */}
                                  {activeTab === 'vinyl' && (
                                    <button
                                      onClick={() => handleIncrementSpin(item)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 transition-colors"
                                      title="Log another turntable spin to Cloud"
                                    >
                                      <Play className="w-3 h-3 fill-current" />
                                      {item.spinCount || 0} Spins (+1)
                                    </button>
                                  )}

                                  {activeTab === 'cards' && (
                                    <div className="text-right">
                                      <span className="text-sm font-extrabold text-emerald-500">
                                        ${Number(item.value || 0).toLocaleString()}
                                      </span>
                                      <span
                                        className={`block text-[11px] font-bold ${
                                          profitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'
                                        }`}
                                      >
                                        {profitLoss >= 0 ? `+$${profitLoss}` : `-$${Math.abs(profitLoss)}`} P/L
                                      </span>
                                    </div>
                                  )}

                                  {(activeTab === 'books' || activeTab === 'games') &&
                                    renderStars(item.rating)}
                                </div>

                                {/* Primary Title & Subtitle */}
                                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                                  {activeTab === 'cards' ? item.player : item.title}
                                </h3>

                                {activeTab === 'vinyl' && (
                                  <>
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                                      {item.artist} • <span className="text-slate-400">{item.year}</span>
                                    </p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">
                                      {item.genre} • {item.variant}
                                    </p>
                                  </>
                                )}

                                {activeTab === 'books' && (
                                  <>
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                                      by {item.author}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1.5">
                                      {item.genre} • {item.format} • {item.pages} pages
                                    </p>
                                  </>
                                )}

                                {activeTab === 'cards' && (
                                  <>
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                                      {item.yearSet} {item.cardNumber}
                                    </p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">
                                      {item.sport} • {item.parallel} (Paid ${item.purchasePrice || 0})
                                    </p>
                                  </>
                                )}

                                {activeTab === 'games' && (
                                  <>
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                                      {item.platform} • <span className="text-slate-400">{item.genre}</span>
                                    </p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">
                                      {item.hoursPlayed || 0} Hours Logged
                                    </p>
                                  </>
                                )}

                                {item.notes && (
                                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/70 rounded-xl p-3 border border-slate-100 dark:border-slate-800 mt-3 leading-relaxed">
                                    {item.notes}
                                  </p>
                                )}
                              </div>

                              {/* Card Footer Actions */}
                              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                  onClick={() => openEditModal('collection', activeTab, item)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => requestDelete('collection', activeTab, item)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {/* ================================================================== */}
        {/* ADD / EDIT ENTRY MODAL                                             */}
        {/* ================================================================== */}
        {entryModal.open && (
          <EntryFormModal
            mode={entryModal.mode}
            catType={entryModal.catType}
            catKey={entryModal.catKey}
            initialItem={entryModal.item}
            onClose={() => setEntryModal((prev) => ({ ...prev, open: false }))}
            onSave={handleSaveEntry}
          />
        )}

        {/* ================================================================== */}
        {/* CLOUD ACCOUNT & CROSS-DEVICE SYNC MODAL                            */}
        {/* ================================================================== */}
        {accountModalOpen && (
          <CloudAccountModal
            user={user}
            onClose={() => setAccountModalOpen(false)}
            onSuccess={(msg) => {
              triggerToast(msg, 'success');
              setAccountModalOpen(false);
            }}
            onError={(msg) => triggerToast(msg, 'error')}
          />
        )}

        {/* ================================================================== */}
        {/* STEP-BY-STEP CLOUD & USAGE GUIDE MODAL                             */}
        {/* ================================================================== */}
        {guideModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-extrabold flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-500" />
                  Cloud Storage & Quick Start Guide
                </h3>
                <button
                  onClick={() => setGuideModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    1. Real-Time Cloud Sync Across Devices
                  </h4>
                  <p>
                    Every item you add or edit is saved directly to <strong>Cloud Firestore</strong> under your unique user ID. Click the <strong>Synced to Cloud</strong> badge in the header (or your account card in the sidebar) to sign in with Email/Password or Google so you can access the exact same vault on your phone, tablet, and desktop.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    2. Auto-Fetch & Manual Override Protection
                  </h4>
                  <p>
                    Use <strong>Auto-Fetch</strong> in the top bar to simulate pulling live results for NASCAR, PGA Tour, and MSU Football, Basketball, and Hockey. Whenever you manually add or edit a sports item, it gets a <strong>Manual Override</strong> lock badge so future auto-syncs never overwrite your manual updates.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    3. Seeding, Exporting & Batch Importing
                  </h4>
                  <p>
                    If your cloud account is empty, click <strong>Load Starter Sample Data</strong> to populate all 9 trackers. Use <strong>Export JSON</strong> for portable backups or <strong>Import JSON</strong> to batch-upload a backup file directly into Firestore.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setGuideModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-[#18453B] text-white text-sm font-bold"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* CUSTOM CONFIRMATION DIALOG                                         */}
        {/* ================================================================== */}
        {confirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-lg font-extrabold">{confirmDialog.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                {confirmDialog.message}
              </p>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className={`px-4 py-2 rounded-xl text-sm font-bold text-white ${
                    confirmDialog.danger ? 'bg-rose-600 hover:bg-rose-500' : 'bg-[#18453B]'
                  }`}
                >
                  {confirmDialog.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TOAST NOTIFICATION                                                 */}
        {/* ================================================================== */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] bg-slate-900 dark:bg-slate-800 text-white border border-slate-700 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <p className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction();
                    setToast(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  {toast.actionLabel}
                </button>
              )}
              <button
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CLOUD ACCOUNT & AUTHENTICATION MODAL (Switch to Email/Password or Google)
// ============================================================================
function CloudAccountModal({ user, onClose, onSuccess, onError }) {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setBusy(true);
    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        onSuccess('Cloud account created & signed in!');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        onSuccess('Signed in to your Cloud Vault!');
      }
    } catch (err) {
      onError(err.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onSuccess('Signed in with Google!');
    } catch (err) {
      onError(err.message || 'Google Sign-In failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await signOut(auth);
      onSuccess('Signed out of Cloud session.');
    } catch (err) {
      onError('Failed to sign out.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-extrabold">Cloud Account & Sync</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-500">
                {user.isAnonymous ? 'Active Guest Session' : 'Authenticated Cloud Account'}
              </span>
              <button
                onClick={handleSignOut}
                disabled={busy}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:underline"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
            {!user.isAnonymous && user.email && (
              <p className="text-sm font-bold">{user.email}</p>
            )}
            <p className="text-[11px] font-mono text-slate-400 break-all">
              User ID: {user.uid}
            </p>
          </div>
        )}

        {user?.isAnonymous && (
          <div className="mt-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              You are currently in a <strong>Guest Cloud Session</strong>. Sign in with Google or Email/Password below to access your vault seamlessly across multiple devices.
            </p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={busy}
              className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Continue with Google
            </button>

            <div className="relative my-4 text-center">
              <span className="px-2 bg-white dark:bg-slate-900 text-[11px] uppercase font-bold text-slate-400 relative z-10">
                Or use Email & Password
              </span>
              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                  authMode === 'signin'
                    ? 'bg-[#18453B] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                  authMode === 'signup'
                    ? 'bg-[#18453B] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none"
                />
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 chars)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-xl bg-[#18453B] hover:bg-[#1f574b] text-white font-bold text-sm"
              >
                {busy
                  ? 'Authenticating...'
                  : authMode === 'signup'
                  ? 'Create Cloud Account'
                  : 'Sign In to Cloud Vault'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STANDALONE SIGN-IN SCREEN (Shown when user explicitly signs out)
// ============================================================================
function AuthScreen({ darkMode, setDarkMode, onSuccess, onError }) {
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleGuestSignIn = async () => {
    setBusy(true);
    try {
      await signInAnonymously(auth);
      onSuccess('Signed in as Guest to Cloud Vault!');
    } catch (err) {
      onError(err.message || 'Guest sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onSuccess('Signed in with Google!');
    } catch (err) {
      onError(err.message || 'Google sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        onSuccess('Account created!');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        onSuccess('Welcome back!');
      }
    } catch (err) {
      onError(err.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#18453B] text-white flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg">My Vault & Arena</h1>
              <p className="text-xs text-emerald-500 font-semibold">Cloud-Synced Tracker</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <button
          type="button"
          onClick={handleGuestSignIn}
          disabled={busy}
          className="w-full py-3 px-4 rounded-xl bg-[#18453B] hover:bg-[#1f574b] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          Continue as Guest / Anonymous Sign-In
        </button>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={busy}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm flex items-center justify-center gap-2"
        >
          Sign in with Google
        </button>

        <div className="relative text-center">
          <span className="px-2 bg-white dark:bg-slate-900 text-[11px] uppercase font-bold text-slate-400 relative z-10">
            Or Email & Password
          </span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
              authMode === 'signin'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
              authMode === 'signup'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm"
          >
            {busy ? 'Please wait...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// DYNAMIC ENTRY / OVERRIDE MODAL COMPONENT
// ============================================================================
function EntryFormModal({ mode, catType, catKey, initialItem, onClose, onSave }) {
  const [selectedKey, setSelectedKey] = useState(catKey);

  // Sport fields
  const [season, setSeason] = useState(initialItem?.season || '2026-27');
  const [date, setDate] = useState(initialItem?.date || new Date().toISOString().slice(0, 10));
  const [event, setEvent] = useState(initialItem?.event || '');
  const [venue, setVenue] = useState(initialItem?.venue || '');
  const [status, setStatus] = useState(initialItem?.status || 'Completed');
  const [msuScore, setMsuScore] = useState(initialItem?.msuScore ?? '');
  const [oppScore, setOppScore] = useState(initialItem?.oppScore ?? '');
  const [outcome, setOutcome] = useState(initialItem?.outcome || 'W');
  const [winnerOrScore, setWinnerOrScore] = useState(initialItem?.winnerOrScore || '');
  const [extraStat, setExtraStat] = useState(initialItem?.extraStat || '');
  const [notes, setNotes] = useState(initialItem?.notes || '');

  // Collection fields
  const [title, setTitle] = useState(initialItem?.title || '');
  const [artist, setArtist] = useState(initialItem?.artist || '');
  const [author, setAuthor] = useState(initialItem?.author || '');
  const [player, setPlayer] = useState(initialItem?.player || '');
  const [year, setYear] = useState(initialItem?.year || 2024);
  const [yearSet, setYearSet] = useState(initialItem?.yearSet || '');
  const [genre, setGenre] = useState(initialItem?.genre || '');
  const [variant, setVariant] = useState(initialItem?.variant || '');
  const [condition, setCondition] = useState(initialItem?.condition || 'NM');
  const [spinCount, setSpinCount] = useState(initialItem?.spinCount ?? 1);
  const [format, setFormat] = useState(initialItem?.format || 'Hardcover');
  const [colStatus, setColStatus] = useState(
    initialItem?.status || (catKey === 'books' ? 'Reading' : 'Playing')
  );
  const [pages, setPages] = useState(initialItem?.pages ?? 300);
  const [sport, setSport] = useState(initialItem?.sport || 'Football');
  const [cardNumber, setCardNumber] = useState(initialItem?.cardNumber || '');
  const [parallel, setParallel] = useState(initialItem?.parallel || '');
  const [grading, setGrading] = useState(initialItem?.grading || 'Raw');
  const [purchasePrice, setPurchasePrice] = useState(initialItem?.purchasePrice ?? 0);
  const [value, setValue] = useState(initialItem?.value ?? 0);
  const [platform, setPlatform] = useState(initialItem?.platform || 'PS5');
  const [hoursPlayed, setHoursPlayed] = useState(initialItem?.hoursPlayed ?? 0);
  const [rating, setRating] = useState(initialItem?.rating ?? 5);

  const isMSU = SPORT_CONFIG[selectedKey]?.isMSU;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (catType === 'sport') {
      if (!event.trim()) return;
      let computedWinnerOrScore = winnerOrScore.trim();
      let computedOutcome = outcome;

      if (isMSU) {
        if (status === 'Upcoming') {
          computedWinnerOrScore = 'TBD';
          computedOutcome = 'TBD';
        } else if (msuScore !== '' && oppScore !== '') {
          const m = Number(msuScore);
          const o = Number(oppScore);
          computedOutcome = m > o ? 'W' : m < o ? 'L' : 'T';
          if (!computedWinnerOrScore) {
            computedWinnerOrScore = `${computedOutcome} ${m}–${o}`;
          }
        }
      } else if (status === 'Upcoming' && !computedWinnerOrScore) {
        computedWinnerOrScore = 'TBD';
      }

      onSave('sport', selectedKey, {
        season: season.trim() || '2026-27',
        date,
        event: event.trim(),
        venue: venue.trim() || 'TBD Venue',
        status,
        msuScore: isMSU && msuScore !== '' ? Number(msuScore) : '',
        oppScore: isMSU && oppScore !== '' ? Number(oppScore) : '',
        outcome: isMSU ? computedOutcome : '',
        winnerOrScore: computedWinnerOrScore || 'Completed',
        extraStat: extraStat.trim(),
        notes: notes.trim()
      });
    } else {
      if (selectedKey === 'vinyl') {
        if (!title.trim()) return;
        onSave('collection', 'vinyl', {
          artist: artist.trim() || 'Unknown Artist',
          title: title.trim(),
          year: Number(year) || 2024,
          genre: genre.trim() || 'Rock',
          variant: variant.trim() || '180g Black LP',
          condition,
          value: Number(value) || 0,
          spinCount: Number(spinCount) || 0,
          notes: notes.trim()
        });
      } else if (selectedKey === 'books') {
        if (!title.trim()) return;
        onSave('collection', 'books', {
          title: title.trim(),
          author: author.trim() || 'Unknown Author',
          genre: genre.trim() || 'General',
          format,
          status: colStatus,
          rating: Number(rating),
          pages: Number(pages) || 0,
          notes: notes.trim()
        });
      } else if (selectedKey === 'cards') {
        if (!player.trim()) return;
        onSave('collection', 'cards', {
          player: player.trim(),
          yearSet: yearSet.trim() || '2024 Base',
          sport: sport.trim() || 'Sports',
          cardNumber: cardNumber.trim(),
          parallel: parallel.trim() || 'Base',
          grading: grading.trim() || 'Raw',
          purchasePrice: Number(purchasePrice) || 0,
          value: Number(value) || 0,
          notes: notes.trim()
        });
      } else if (selectedKey === 'games') {
        if (!title.trim()) return;
        onSave('collection', 'games', {
          title: title.trim(),
          platform: platform.trim() || 'PC',
          genre: genre.trim() || 'Action',
          status: colStatus,
          hoursPlayed: Number(hoursPlayed) || 0,
          rating: Number(rating),
          notes: notes.trim()
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
              {catType === 'sport' ? 'Cloud Manual Entry & Override Lock' : 'Cloud Vault Catalog'}
            </span>
            <h3 className="text-lg font-extrabold">
              {mode === 'add' ? 'Add' : 'Edit'}{' '}
              {catType === 'sport'
                ? SPORT_CONFIG[selectedKey]?.label
                : COLLECTION_CONFIG[selectedKey]?.singular}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === 'add' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm font-semibold outline-none"
              >
                {catType === 'sport'
                  ? Object.entries(SPORT_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))
                  : Object.entries(COLLECTION_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
              </select>
            </div>
          )}

          {/* SPORT FORM */}
          {catType === 'sport' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Season</label>
                  <input
                    type="text"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    placeholder="2026-27"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Live">Live</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Event / Opponent *
                </label>
                <input
                  type="text"
                  required
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  placeholder="e.g., vs. Michigan Wolverines or Daytona 500"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Venue / Track / Course
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g., Spartan Stadium, East Lansing, MI"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                />
              </div>

              {isMSU && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">MSU Score</label>
                    <input
                      type="number"
                      value={msuScore}
                      onChange={(e) => setMsuScore(e.target.value)}
                      placeholder="27"
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Opp Score</label>
                    <input
                      type="number"
                      value={oppScore}
                      onChange={(e) => setOppScore(e.target.value)}
                      placeholder="24"
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Outcome</label>
                    <select
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value)}
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                    >
                      <option value="W">Win (W)</option>
                      <option value="L">Loss (L)</option>
                      <option value="T">Tie (T)</option>
                      <option value="TBD">TBD</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {isMSU ? 'Display Score Label (Auto-fills if blank)' : 'Winner / Final Result'}
                  </label>
                  <input
                    type="text"
                    value={winnerOrScore}
                    onChange={(e) => setWinnerOrScore(e.target.value)}
                    placeholder={isMSU ? 'e.g., W 27–24' : 'e.g., Winner: Kyle Larson (#5)'}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Pole / Purse / Location Tag
                  </label>
                  <input
                    type="text"
                    value={extraStat}
                    onChange={(e) => setExtraStat(e.target.value)}
                    placeholder="e.g., Home • Big Ten or Purse: $20M"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* VINYL FORM */}
          {catType === 'collection' && selectedKey === 'vinyl' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Artist *</label>
                  <input
                    type="text"
                    required
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Album Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Genre</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  >
                    <option value="Mint">Mint</option>
                    <option value="NM">NM</option>
                    <option value="VG+">VG+</option>
                    <option value="VG">VG</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Est. Value ($)</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Spin Count</label>
                  <input
                    type="number"
                    value={spinCount}
                    onChange={(e) => setSpinCount(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Variant</label>
                  <input
                    type="text"
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    placeholder="180g Black"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* BOOKS FORM */}
          {catType === 'collection' && selectedKey === 'books' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Author *</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  >
                    <option value="Hardcover">Hardcover</option>
                    <option value="Paperback">Paperback</option>
                    <option value="Audiobook">Audiobook</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                  <select
                    value={colStatus}
                    onChange={(e) => setColStatus(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  >
                    <option value="Reading">Reading</option>
                    <option value="Completed">Completed</option>
                    <option value="TBR/Wishlist">TBR/Wishlist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Pages</label>
                  <input
                    type="number"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Genre</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                    <option value={0}>Unrated</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* SPORTS CARDS FORM */}
          {catType === 'collection' && selectedKey === 'cards' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Player Name *</label>
                  <input
                    type="text"
                    required
                    value={player}
                    onChange={(e) => setPlayer(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Year & Set/Brand *</label>
                  <input
                    type="text"
                    required
                    value={yearSet}
                    onChange={(e) => setYearSet(e.target.value)}
                    placeholder="e.g., 2024 Topps Chrome"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Sport</label>
                  <input
                    type="text"
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Card #</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="#101"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Grading</label>
                  <select
                    value={grading}
                    onChange={(e) => setGrading(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  >
                    <option value="Raw">Raw</option>
                    <option value="PSA 10">PSA 10</option>
                    <option value="PSA 9">PSA 9</option>
                    <option value="PSA 8">PSA 8</option>
                    <option value="BGS 9.5">BGS 9.5</option>
                    <option value="SGC 10">SGC 10</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Parallel/Serial</label>
                  <input
                    type="text"
                    value={parallel}
                    onChange={(e) => setParallel(e.target.value)}
                    placeholder="Silver /99"
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Purchase ($)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Est. Value ($)</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* VIDEO GAMES FORM */}
          {catType === 'collection' && selectedKey === 'games' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Game Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  >
                    <option value="PS5">PS5</option>
                    <option value="Xbox Series X">Xbox Series X</option>
                    <option value="Switch">Switch</option>
                    <option value="PC">PC</option>
                    <option value="Retro">Retro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                  <select
                    value={colStatus}
                    onChange={(e) => setColStatus(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  >
                    <option value="Playing">Playing</option>
                    <option value="Completed">Completed</option>
                    <option value="Backlog">Backlog</option>
                    <option value="100%">100%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Hours Played</label>
                  <input
                    type="number"
                    value={hoursPlayed}
                    onChange={(e) => setHoursPlayed(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Genre</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Personal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add personal commentary, memories, or condition notes..."
              className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-[#18453B] hover:bg-[#1f574b] text-white"
            >
              {mode === 'add' ? 'Save to Cloud' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}