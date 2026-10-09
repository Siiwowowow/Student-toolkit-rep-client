import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import './MoodHealthTracker.css';

// Constants & Icons
const icons = {
  dashboard: '📊',
  tracker: '📝',
  goals: '🎯',
  insights: '📈',
  study: '📚',
  nutrition: '🍎',
  exercise: '🏃‍♂️',
  sleep: '😴',
  water: '💧',
  mood: '😊',
  stress: '🧘‍♂️',
  habits: '✅',
  analytics: '📈',
  timer: '⏱️',
  trophy: '🏆',
  fire: '🔥',
  star: '⭐',
  headphones: '🎧',
  shield: '🛡️',
  brain: '🧠',
  lightning: '⚡',
};

const moods = [
  { label: '😰 Overwhelmed', value: 1, color: '#dc2626', description: 'Feeling stressed and heavy' },
  { label: '😔 Low', value: 2, color: '#ea580c', description: 'Down or unmotivated' },
  { label: '😐 Neutral', value: 3, color: '#eab308', description: 'Okay, regular study flow' },
  { label: '😊 Good', value: 4, color: '#06d6a0', description: 'Positive, clear, and ready' },
  { label: '🚀 Hyper-Focused', value: 5, color: '#8338ec', description: 'Unstoppable academic flow' },
];

const studySessionTypes = [
  { type: 'Deep Focus', duration: 90, break: 20, color: '#3a86ff' },
  { type: 'Pomodoro Standard', duration: 45, break: 15, color: '#06d6a0' },
  { type: 'Quick Sprint', duration: 25, break: 5, color: '#f8fb38' },
  { type: 'Group Study', duration: 60, break: 10, color: '#ff3b8d' },
];

const goalTemplates = [
  { category: 'Sleep', goal: 'Get 7-8 hours of sleep daily', target: 7.5, unit: 'hours' },
  { category: 'Water', goal: 'Drink 8 glasses of water daily', target: 8, unit: 'glasses' },
  { category: 'Exercise', goal: 'Exercise or stretch 30 min daily', target: 30, unit: 'minutes' },
  { category: 'Study', goal: 'Deep study 4 hours daily', target: 240, unit: 'minutes' },
  { category: 'Meditation', goal: 'Meditate or de-stress 10 min daily', target: 10, unit: 'minutes' },
];

// Utility Functions
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const bmi = weight / ((height / 100) ** 2);
  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 24.9) category = 'Normal';
  else if (bmi < 29.9) category = 'Overweight';
  else category = 'Obese';
  return { bmi: bmi.toFixed(1), category };
};

const getStreakEmoji = (streak) => {
  if (streak >= 30) return '🔥';
  if (streak >= 14) return '⚡';
  if (streak >= 7) return '✨';
  if (streak >= 3) return '💫';
  return '⭐';
};

// Web Audio Ambient Synthesizer Class
class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.nodes = {};
    this.isPlaying = false;
    this.currentTrack = null;
    this.volume = 0.5;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playRain() {
    this.stop();
    this.init();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = this.volume;

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    whiteNoise.start();
    this.nodes = { source: whiteNoise, gain: gainNode };
    this.isPlaying = true;
    this.currentTrack = 'rain';
  }

  playBrownNoise() {
    this.stop();
    this.init();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = this.volume;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    source.start();
    this.nodes = { source, gain: gainNode };
    this.isPlaying = true;
    this.currentTrack = 'brown';
  }

  playAlphaWaves() {
    this.stop();
    this.init();
    if (!this.ctx) return;

    // 200Hz + 210Hz = 10Hz Alpha Focus Wave
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.value = 200;
    osc2.frequency.value = 210;

    const merger = this.ctx.createChannelMerger(2);
    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();
    gain1.gain.value = 0.25;
    gain2.gain.value = 0.25;

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(merger, 0, 0);
    gain2.connect(merger, 0, 1);

    const masterGain = this.ctx.createGain();
    masterGain.gain.value = this.volume;
    merger.connect(masterGain);
    masterGain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();

    this.nodes = { osc1, osc2, gain: masterGain };
    this.isPlaying = true;
    this.currentTrack = 'alpha';
  }

  playZenChimes() {
    this.stop();
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    osc.type = 'sine';
    subOsc.type = 'triangle';
    osc.frequency.value = 432;
    subOsc.frequency.value = 216;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = this.volume * 0.35;

    osc.connect(gainNode);
    subOsc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    subOsc.start();

    this.nodes = { osc, subOsc, gain: gainNode };
    this.isPlaying = true;
    this.currentTrack = 'zen';
  }

  setVolume(val) {
    this.volume = val;
    if (this.nodes.gain) {
      this.nodes.gain.gain.value = val;
    }
  }

  stop() {
    try {
      if (this.nodes.source) this.nodes.source.stop();
      if (this.nodes.osc) this.nodes.osc.stop();
      if (this.nodes.subOsc) this.nodes.subOsc.stop();
      if (this.nodes.osc1) this.nodes.osc1.stop();
      if (this.nodes.osc2) this.nodes.osc2.stop();
    } catch (e) {
      // Ignored if already stopped
    }
    this.nodes = {};
    this.isPlaying = false;
    this.currentTrack = null;
  }
}

// Global audio engine singleton
const audioEngine = new AmbientAudioEngine();

// Toast Notifications
const Toast = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3200);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 18px',
        background: '#ffffff',
        border: '2.5px solid #0e121d',
        borderRadius: '14px',
        boxShadow: '4px 4px 0px #0e121d',
        fontWeight: '800',
        fontSize: '13px',
        color: '#0e121d',
        animation: 'slideIn 0.2s ease',
      }}
    >
      <span style={{ fontSize: '18px' }}>
        {type === 'success' ? '⚡' : type === 'info' ? '💧' : '💡'}
      </span>
      <span>{message}</span>
      <button
        onClick={() => onClose(id)}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          fontWeight: '900',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => (
  <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {toasts.map((toast) => (
      <Toast key={toast.id} {...toast} onClose={removeToast} />
    ))}
  </div>
);

// Navigation Component
const Navigation = ({ activeTab, setActiveTab }) => {
  const mainTabs = [
    { id: 'dashboard', label: 'Command Center', icon: icons.dashboard },
    { id: 'focus', label: 'Deep Focus Lab', icon: icons.timer },
    { id: 'destress', label: 'De-Stress & Soundscapes', icon: icons.headphones, badge: 'NEW' },
    { id: 'tracker', label: 'Daily Check-In', icon: icons.tracker },
    { id: 'goals', label: 'Goals & Habits', icon: icons.goals },
    { id: 'insights', label: 'Analytics & Trends', icon: icons.insights },
  ];

  return (
    <nav className="wellness-nav-bar">
      <div className="wellness-nav-scroll">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`wellness-nav-btn ${activeTab === tab.id ? 'is-active' : ''}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge && <span className="wellness-nav-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
};

// Quick Stats Component
const QuickStats = ({ formData, quickActions, studyTimer, goals }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div className="wellness-stat-card wellness-stat-mood">
      <div>
        <p className="wellness-stat-title">Current Mood</p>
        <p className="wellness-stat-val">
          {moods.find((m) => m.label === formData.mood)?.label.split(' ')[0] || '😐'}
        </p>
      </div>
      <div className="wellness-stat-icon">{icons.mood}</div>
    </div>
    <div className="wellness-stat-card wellness-stat-water">
      <div>
        <p className="wellness-stat-title">Hydration</p>
        <p className="wellness-stat-val">{quickActions.waterGlasses} / 8 <small style={{ fontSize: '16px' }}>glasses</small></p>
      </div>
      <div className="wellness-stat-icon">{icons.water}</div>
    </div>
    <div className="wellness-stat-card wellness-stat-study">
      <div>
        <p className="wellness-stat-title">Focus Sessions</p>
        <p className="wellness-stat-val">{studyTimer.completedSessions} <small style={{ fontSize: '16px' }}>done</small></p>
      </div>
      <div className="wellness-stat-icon">{icons.study}</div>
    </div>
    <div className="wellness-stat-card wellness-stat-streak">
      <div>
        <p className="wellness-stat-title">Top Streak</p>
        <p className="wellness-stat-val">
          {Math.max(...goals.map((g) => g.streak || 0))} {getStreakEmoji(Math.max(...goals.map((g) => g.streak || 0)))}
        </p>
      </div>
      <div className="wellness-stat-icon">{icons.fire}</div>
    </div>
  </div>
);

// Focus Timer Widget Component
const StudyTimerWidget = ({ studyTimer, toggleTimer, resetTimer, startStudyTimer }) => {
  const phaseDuration = (studyTimer.isBreak ? studyTimer.sessionType.break : studyTimer.sessionType.duration) * 60;
  const elapsedProgress = phaseDuration ? ((phaseDuration - studyTimer.timeLeft) / phaseDuration) * 100 : 0;
  const ringColor = studyTimer.isBreak ? '#06d6a0' : studyTimer.sessionType.color;

  return (
    <section className={`wellness-focus-card ${studyTimer.isBreak ? 'is-break' : ''}`}>
      <div className="wellness-focus-copy">
        <span className="wellness-kicker">
          {studyTimer.isBreak ? '🌿 RECOVER & RESET' : '⚡ ACADEMIC FOCUS ZONE'}
        </span>
        <h2>{studyTimer.isBreak ? 'Step back & recharge.' : 'Enter Flow State.'}</h2>
        <p>
          {studyTimer.isBreak
            ? 'Rest your eyes, hydrate, and stretch. Your brain synthesizes what you learned while resting.'
            : 'Single-task only. Silence distractions and immerse yourself in your academic goals.'}
        </p>
        <div className="wellness-focus-status">
          <span className={`wellness-status-dot ${studyTimer.isActive ? 'is-running' : ''}`} />
          <span>{studyTimer.isActive ? 'Timer Active' : studyTimer.isBreak ? 'Break Ready' : 'Ready'}</span>
          <span>·</span>
          <span>{studyTimer.isBreak ? `${studyTimer.sessionType.break}m Break` : `${studyTimer.sessionType.type} (${studyTimer.sessionType.duration}m)`}</span>
        </div>
      </div>

      <div className="wellness-focus-console">
        <div
          className="wellness-timer-ring"
          style={{ '--timer-progress': `${elapsedProgress}%`, '--timer-accent': ringColor }}
          role="timer"
          aria-label={`${formatTime(studyTimer.timeLeft)} remaining`}
        >
          <div className="wellness-timer-face">
            <span>{studyTimer.isBreak ? 'BREAK TIME' : 'STUDY FOCUS'}</span>
            <strong>{formatTime(studyTimer.timeLeft)}</strong>
            <small>{studyTimer.isActive ? 'In Progress' : 'Remaining'}</small>
          </div>
        </div>
        <div className="wellness-timer-controls">
          <button className="wellness-timer-start" onClick={toggleTimer}>
            {studyTimer.isActive ? '⏸ Pause' : studyTimer.isBreak ? '▶ Start Break' : '▶ Start Focus'}
          </button>
          <button className="wellness-timer-reset" onClick={resetTimer}>
            ↺ Reset
          </button>
        </div>
      </div>

      <div className="wellness-session-picker">
        <div className="wellness-picker-heading">
          <span>Choose Focus Rhythm</span>
          <small>Tailored for student productivity cycles</small>
        </div>
        <div className="wellness-session-options">
          {studySessionTypes.map((session) => (
            <button
              key={session.type}
              className={`wellness-session-option ${studyTimer.sessionType.type === session.type ? 'is-selected' : ''}`}
              onClick={() => startStudyTimer(session)}
            >
              <div className="wellness-session-label">
                <strong>{session.type}</strong>
                <small>{session.duration}m Focus · {session.break}m Break</small>
              </div>
              <span className="wellness-session-duration">{session.duration}m</span>
            </button>
          ))}
        </div>
        <p className="wellness-session-count">
          <span>{studyTimer.completedSessions}</span> sessions conquered today!
        </p>
      </div>
    </section>
  );
};

// Quick Actions Component
const QuickActions = ({ addWaterGlass, setActiveTab, quickActions }) => (
  <div className="wellness-card">
    <div className="wellness-section-heading" style={{ marginBottom: '14px' }}>
      <span className="wellness-kicker">⚡ QUICK POWER MOVES</span>
      <h2>Instant Study Wellness Actions</h2>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button onClick={addWaterGlass} className="wellness-action-btn wellness-action-water">
        <span style={{ fontSize: '32px', marginBottom: '6px' }}>{icons.water}</span>
        <strong style={{ fontSize: '14px', color: 'var(--m-ink)' }}>+1 Glass Water</strong>
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{quickActions.waterGlasses} logged today</span>
      </button>
      <button onClick={() => setActiveTab('destress')} className="wellness-action-btn wellness-action-study">
        <span style={{ fontSize: '32px', marginBottom: '6px' }}>{icons.headphones}</span>
        <strong style={{ fontSize: '14px', color: 'var(--m-ink)' }}>Lo-Fi Audio Lab</strong>
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Rain & Alpha Waves</span>
      </button>
      <button onClick={() => setActiveTab('tracker')} className="wellness-action-btn wellness-action-mood">
        <span style={{ fontSize: '32px', marginBottom: '6px' }}>{icons.mood}</span>
        <strong style={{ fontSize: '14px', color: 'var(--m-ink)' }}>Log Daily Mood</strong>
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Track energy levels</span>
      </button>
      <button onClick={() => setActiveTab('focus')} className="wellness-action-btn wellness-action-goals">
        <span style={{ fontSize: '32px', marginBottom: '6px' }}>{icons.timer}</span>
        <strong style={{ fontSize: '14px', color: 'var(--m-ink)' }}>Launch Pomodoro</strong>
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Crush today's tasks</span>
      </button>
    </div>
  </div>
);

// Habits Tracker Component
const HabitsTracker = ({ habits, toggleHabit }) => (
  <div className="wellness-card">
    <div className="wellness-section-heading" style={{ marginBottom: '14px' }}>
      <span className="wellness-kicker">✅ DAILY ACADEMIC ROUTINES</span>
      <h2>Today's Keystone Habits</h2>
    </div>
    <div>
      {habits.map((habit) => (
        <div key={habit.id} className="wellness-habit-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => toggleHabit(habit.id)}
              className={`wellness-check-circle ${habit.completed ? 'is-done' : ''}`}
            >
              {habit.completed ? '✓' : ''}
            </button>
            <div>
              <span
                style={{
                  fontSize: '14.5px',
                  fontWeight: '800',
                  color: habit.completed ? '#94a3b8' : 'var(--m-ink)',
                  textDecoration: habit.completed ? 'line-through' : 'none',
                }}
              >
                {habit.name}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b' }}>
              {habit.streak} day streak
            </span>
            <span style={{ fontSize: '18px' }}>{getStreakEmoji(habit.streak)}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Weekly Overview Chart Component
const WeeklyOverviewChart = ({ chartData }) => (
  <div className="wellness-card">
    <div className="wellness-section-heading">
      <span className="wellness-kicker">📊 7-DAY VITALS OVERVIEW</span>
      <h2>Study Rhythm & Energy Flow</h2>
      <p>Tracking correlation between study hours, sleep restoration, and mood score.</p>
    </div>
    <div style={{ height: '320px', width: '100%', marginTop: '16px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#0e121d" style={{ fontWeight: 800, fontSize: '12px' }} />
          <YAxis stroke="#0e121d" style={{ fontWeight: 800, fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '2.5px solid #0e121d',
              borderRadius: '12px',
              boxShadow: '4px 4px 0px #0e121d',
              fontWeight: 800,
            }}
          />
          <Area type="monotone" dataKey="mood" stackId="1" stroke="#3a86ff" fill="#3a86ff" fillOpacity={0.65} name="Mood Score" />
          <Area type="monotone" dataKey="energy" stackId="2" stroke="#06d6a0" fill="#06d6a0" fillOpacity={0.65} name="Energy Level" />
          <Area type="monotone" dataKey="sleep" stackId="3" stroke="#8338ec" fill="#8338ec" fillOpacity={0.65} name="Sleep (Hours)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// ========================================================
// BRAND NEW FEATURE COMPONENT: DE-STRESS & SOUNDSCAPES LAB
// ========================================================
const DestressAndSoundLab = ({ formData, addToast }) => {
  // Soundscapes State
  const [activeSound, setActiveSound] = useState(null);
  const [volume, setVolume] = useState(0.5);

  // Box Breathing State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold-in, exhale, hold-out
  const [breathTimer, setBreathTimer] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  // Brain Dump State
  const [brainDumpText, setBrainDumpText] = useState('');

  // Sounds List
  const soundTracks = [
    { id: 'rain', name: 'Library Window Rain', desc: 'Soothing pink noise blocking dormitory chatter', icon: '🌧️' },
    { id: 'brown', name: 'Campus Cafe Brown Noise', desc: 'Deep warm frequency for ADHD focus & reading', icon: '☕' },
    { id: 'alpha', name: '10Hz Alpha Focus Waves', desc: 'Binaural beat stimulating laser focus & retention', icon: '🌊' },
    { id: 'zen', name: '432Hz Zen Drone', desc: 'Acoustic calm harmonic frequency for pre-exam zen', icon: '🔔' },
  ];

  // Sound Controller
  const handleToggleSound = (id) => {
    if (activeSound === id) {
      audioEngine.stop();
      setActiveSound(null);
      addToast('Ambient audio stopped', 'info');
    } else {
      if (id === 'rain') audioEngine.playRain();
      else if (id === 'brown') audioEngine.playBrownNoise();
      else if (id === 'alpha') audioEngine.playAlphaWaves();
      else if (id === 'zen') audioEngine.playZenChimes();
      audioEngine.setVolume(volume);
      setActiveSound(id);
      addToast(`Playing ${soundTracks.find((s) => s.id === id)?.name}! 🎧`, 'success');
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
  };

  // Box Breathing Lifecycle
  useEffect(() => {
    let interval = null;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            // Transition phase
            setBreathPhase((currentPhase) => {
              if (currentPhase === 'inhale') return 'hold-in';
              if (currentPhase === 'hold-in') return 'exhale';
              if (currentPhase === 'exhale') return 'hold-out';
              if (currentPhase === 'hold-out') {
                setCompletedCycles((c) => c + 1);
                return 'inhale';
              }
              return 'inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathTimer(4);
      setBreathPhase('inhale');
    }
    return () => clearInterval(interval);
  }, [breathingActive]);

  // Burnout Score Calculation
  const calculateBurnoutScore = () => {
    let score = 25;
    if (formData.stressLevel >= 4) score += 30;
    else if (formData.stressLevel === 3) score += 15;

    if (formData.sleep < 6) score += 30;
    else if (formData.sleep < 7) score += 15;

    if (formData.studyTime > 300 && formData.sleep < 7) score += 20;
    if (formData.water < 4) score += 10;
    if (formData.meditation >= 10) score -= 15;
    if (formData.exercise >= 30) score -= 15;

    return Math.max(8, Math.min(score, 94));
  };

  const burnoutScore = calculateBurnoutScore();
  const getBurnoutSeverity = (score) => {
    if (score < 38) return { label: 'Optimal Academic Energy', class: 'is-low', tag: '🟢 Thriving', advice: 'Your sleep and stress levels are balanced! Great time for demanding study sessions.' };
    if (score < 68) return { label: 'Moderate Cognitive Fatigue', class: 'is-mid', tag: '🟡 Watch Out', advice: 'You are pushing hard. Take a 15-minute screen-free walk and drink 2 glasses of water.' };
    return { label: 'High Burnout Warning', class: 'is-high', tag: '🔴 Take a Break', advice: 'Urgent: High stress & sleep deficit detected. Stop cramming, do Box Breathing, and aim for 8 hours of sleep tonight!' };
  };

  const severity = getBurnoutSeverity(burnoutScore);

  // Clear Brain Dump
  const clearBrainDump = () => {
    if (!brainDumpText.trim()) return;
    setBrainDumpText('');
    addToast('Mental clutter vanished! Your brain is clear for deep focus. 🧠✨', 'success');
  };

  return (
    <div className="space-y-6">
      {/* 1. Student Burnout & Exam Fatigue Shield */}
      <div className="wellness-burnout-meter-card">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <span className="wellness-kicker">🛡️ AI BURNOUT & EXAM SHIELD</span>
            <h2 style={{ fontSize: '26px', fontWeight: 950, margin: '8px 0 4px', color: 'var(--m-ink)' }}>
              Live Student Fatigue Index
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 600 }}>
              Calculated dynamically from your recent sleep ({formData.sleep}h), logged study time, and stress input.
            </p>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--m-yellow)', border: '2px solid var(--m-ink)', borderRadius: '999px', boxShadow: '2px 2px 0px var(--m-ink)', fontWeight: 900 }}>
            <span>{severity.tag}</span>
            <span>{burnoutScore}% Risk</span>
          </div>
        </div>

        {/* Meter Gauge */}
        <div className="wellness-gauge-bar-wrap">
          <div className={`wellness-gauge-bar-fill ${severity.class}`} style={{ width: `${burnoutScore}%` }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: '#64748b' }}>
          <span>0% (Peak Freshness)</span>
          <span>50% (Pacing Zone)</span>
          <span>100% (High Exhaustion)</span>
        </div>

        <div style={{ marginTop: '16px', padding: '14px 18px', background: '#f8fafc', border: '2px solid var(--m-ink)', borderRadius: '14px', boxShadow: '2.5px 2.5px 0px var(--m-ink)' }}>
          <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--m-ink)', marginBottom: '4px' }}>
            💡 Tactical Academic Suggestion:
          </strong>
          <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
            {severity.advice}
          </span>
        </div>
      </div>

      {/* 2. Web Audio Ambient Lo-Fi Soundscapes */}
      <div className="wellness-soundscape-card">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <span className="wellness-kicker">🎧 AMBIENT SOUNDSCAPES & BINAURAL BEATS</span>
            <h2 style={{ fontSize: '26px', fontWeight: 950, margin: '8px 0 4px', color: 'var(--m-ink)' }}>
              Study Sound Generator
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 600 }}>
              Generates pure audio directly in your browser. Block dorm distractions & accelerate concentration.
            </p>
          </div>
          {activeSound && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--m-cyan)', border: '2px solid var(--m-ink)', borderRadius: '999px', boxShadow: '2px 2px 0px var(--m-ink)', fontWeight: 900, fontSize: '12px' }}>
              <span>ACTIVE AUDIO</span>
              <div className="wellness-equalizer">
                <span className="wellness-eq-bar" />
                <span className="wellness-eq-bar" />
                <span className="wellness-eq-bar" />
              </div>
            </div>
          )}
        </div>

        <div className="wellness-sound-grid">
          {soundTracks.map((sound) => (
            <div
              key={sound.id}
              onClick={() => handleToggleSound(sound.id)}
              className={`wellness-sound-tile ${activeSound === sound.id ? 'is-playing' : ''}`}
            >
              <span className="wellness-sound-tile-icon">{sound.icon}</span>
              <div className="wellness-sound-tile-info">
                <strong>{sound.name}</strong>
                <small>{sound.desc}</small>
              </div>
              {activeSound === sound.id && (
                <div className="wellness-equalizer">
                  <span className="wellness-eq-bar" />
                  <span className="wellness-eq-bar" />
                  <span className="wellness-eq-bar" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Master Volume Controller */}
        <div className="wellness-sound-controls">
          <span style={{ fontSize: '14px', fontWeight: 800 }}>🔊 Master Soundscape Volume:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="wellness-volume-slider"
          />
          <span style={{ fontSize: '13px', fontWeight: 900, width: '40px' }}>{Math.round(volume * 100)}%</span>
          {activeSound && (
            <button
              onClick={() => handleToggleSound(activeSound)}
              className="wellness-btn-secondary"
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              ⏹ Stop Audio
            </button>
          )}
        </div>
      </div>

      {/* 3. Interactive Box Breathing (4-4-4-4) & Brain Dump Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box Breathing Pacer */}
        <div className="wellness-card">
          <div className="wellness-section-heading">
            <span className="wellness-kicker">🧘 4-4-4-4 PROTOCOL</span>
            <h2>Guided Box Breathing</h2>
            <p>Clinically proven to reset cortisol and panic before exams or intense presentations.</p>
          </div>

          <div className="wellness-breathing-box">
            <div className="wellness-breathing-circle-outer">
              <div className={`wellness-breathing-circle ${breathingActive ? breathPhase : ''}`}>
                <span className="wellness-breathing-text">
                  {!breathingActive
                    ? 'READY'
                    : breathPhase === 'inhale'
                    ? 'BREATHE IN'
                    : breathPhase === 'hold-in'
                    ? 'HOLD'
                    : breathPhase === 'exhale'
                    ? 'EXHALE'
                    : 'HOLD'}
                </span>
                <span className="wellness-breathing-countdown">
                  {breathingActive ? breathTimer : '✦'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => setBreathingActive(!breathingActive)}
                className="wellness-btn-primary"
              >
                {breathingActive ? '⏸ Pause Pacer' : '▶ Start 4-4-4-4 Reset'}
              </button>
              {completedCycles > 0 && (
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--m-ink)' }}>
                  🎉 {completedCycles} cycles completed!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pre-Study Brain Dump Scratchpad */}
        <div className="wellness-card">
          <div className="wellness-section-heading">
            <span className="wellness-kicker">🧠 MENTAL DECLUTTER</span>
            <h2>Pre-Study Brain Dump</h2>
            <p>Empty all anxieties, unfinished chores, or random thoughts here so your mind can focus 100%.</p>
          </div>

          <textarea
            value={brainDumpText}
            onChange={(e) => setBrainDumpText(e.target.value)}
            placeholder="Dump mental clutter here... (e.g., 'Worried about tomorrow's math quiz', 'Need to reply to team email', 'Forgot to buy notebook'). Write it all out and shred it!"
            className="wellness-braindump-area"
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
              {brainDumpText.length} characters dumped
            </span>
            <button
              onClick={clearBrainDump}
              className="wellness-btn-primary"
              disabled={!brainDumpText.trim()}
              style={{ background: 'var(--m-pink)', color: '#ffffff' }}
            >
              🔥 Clear & Shred Anxieties ➔
            </button>
          </div>
        </div>
      </div>

      {/* 4. Gamified Student Wellness Badges */}
      <div className="wellness-card">
        <div className="wellness-section-heading">
          <span className="wellness-kicker">🏆 ACADEMIC WELLNESS TROPHIES</span>
          <h2>Your Wellness Badges</h2>
          <p>Hit healthy study targets to unlock energetic maximalist stickers!</p>
        </div>

        <div className="wellness-badge-grid">
          <div className={`wellness-badge-item ${formData.water >= 8 ? 'is-unlocked' : 'is-locked'}`}>
            <span className="wellness-badge-icon">💧</span>
            <div>
              <span className="wellness-badge-name">Hydration Overlord</span>
              <span className="wellness-badge-req">{formData.water >= 8 ? 'UNLOCKED! ✦' : 'Need 8 glasses/day'}</span>
            </div>
          </div>
          <div className={`wellness-badge-item ${formData.sleep >= 7.5 ? 'is-unlocked' : 'is-locked'}`}>
            <span className="wellness-badge-icon">🌙</span>
            <div>
              <span className="wellness-badge-name">Sleep Champion</span>
              <span className="wellness-badge-req">{formData.sleep >= 7.5 ? 'UNLOCKED! ✦' : 'Need 7.5+ hours'}</span>
            </div>
          </div>
          <div className={`wellness-badge-item ${completedCycles >= 2 ? 'is-unlocked' : 'is-locked'}`}>
            <span className="wellness-badge-icon">🧘</span>
            <div>
              <span className="wellness-badge-name">Zen Master</span>
              <span className="wellness-badge-req">{completedCycles >= 2 ? 'UNLOCKED! ✦' : 'Complete 2 breathing rounds'}</span>
            </div>
          </div>
          <div className={`wellness-badge-item ${formData.studyTime >= 180 ? 'is-unlocked' : 'is-locked'}`}>
            <span className="wellness-badge-icon">⚡</span>
            <div>
              <span className="wellness-badge-name">Deep Work Titan</span>
              <span className="wellness-badge-req">{formData.studyTime >= 180 ? 'UNLOCKED! ✦' : 'Need 3+ hours study'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Daily Tracker Component
const DailyTracker = ({ formData, handleFormChange, saveEntry, currentBMI, today }) => (
  <div className="wellness-tracker-section space-y-6">
    <div className="wellness-card">
      <div className="wellness-section-heading">
        <span className="wellness-kicker">📝 DAILY WELLNESS LOG</span>
        <h2>Daily Check-in & Self Audit</h2>
        <p>Notice how you feel, record your fuel and rest, and keep your body ready for learning.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Date */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '2px solid var(--m-ink)' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>Date</label>
            <input
              type="date"
              value={formData.date}
              max={today}
              onChange={(e) => handleFormChange('date', e.target.value)}
              className="wellness-input"
            />
          </div>

          {/* Mood Picker */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '2px solid var(--m-ink)' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>
              How are you feeling today?
            </label>
            <div className="grid grid-cols-1 gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => handleFormChange('mood', mood.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '2px solid var(--m-ink)',
                    background: formData.mood === mood.label ? 'var(--m-yellow)' : '#ffffff',
                    boxShadow: formData.mood === mood.label ? '3px 3px 0px var(--m-ink)' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{mood.label.split(' ')[0]}</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--m-ink)' }}>
                      {mood.label.split(' ').slice(1).join(' ')}
                    </strong>
                    <small style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                      {mood.description}
                    </small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Hours Slider */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '2px solid var(--m-ink)' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
              <span>Sleep Hours</span>
              <span style={{ color: 'var(--m-violet)', fontWeight: 900 }}>{formData.sleep} hours</span>
            </label>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={formData.sleep}
              onChange={(e) => handleFormChange('sleep', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--m-ink)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: '#64748b', marginTop: '4px' }}>
              <span>0h</span>
              <span style={{ color: formData.sleep >= 7 && formData.sleep <= 9 ? 'var(--m-cyan)' : '#64748b', fontWeight: 900 }}>
                Ideal: 7-9h
              </span>
              <span>12h</span>
            </div>
          </div>

          {/* Water Intake */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '2px solid var(--m-ink)' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, marginBottom: '8px' }}>
              <span>Water Intake</span>
              <span style={{ color: 'var(--m-blue)', fontWeight: 900 }}>{formData.water} glasses</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px', marginBottom: '10px' }}>
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: '24px',
                    borderRadius: '6px',
                    border: '1.5px solid var(--m-ink)',
                    background: i < formData.water ? 'var(--m-cyan)' : '#ffffff',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleFormChange('water', formData.water + amount)}
                  className="wellness-btn-secondary"
                  style={{ flex: 1, padding: '8px' }}
                >
                  +{amount} 💧
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Study Time Slider */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '2px solid var(--m-ink)' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
              <span>Study Time Logged</span>
              <span style={{ color: 'var(--m-pink)', fontWeight: 900 }}>
                {Math.floor(formData.studyTime / 60)}h {formData.studyTime % 60}m
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="480"
              step="15"
              value={formData.studyTime}
              onChange={(e) => handleFormChange('studyTime', parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--m-ink)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: '#64748b', marginTop: '4px' }}>
              <span>0m</span>
              <span>Goal: 4h</span>
              <span>8h</span>
            </div>
          </div>

          {/* Stress Level */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '2px solid var(--m-ink)' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, marginBottom: '8px' }}>
              <span>Stress Level</span>
              <span style={{ color: 'var(--m-orange)', fontWeight: 900 }}>{formData.stressLevel} / 5</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleFormChange('stressLevel', level)}
                  style={{
                    flex: 1,
                    padding: '10px 4px',
                    borderRadius: '10px',
                    border: '2px solid var(--m-ink)',
                    background: formData.stressLevel === level ? 'var(--m-yellow)' : '#ffffff',
                    boxShadow: formData.stressLevel === level ? '2px 2px 0px var(--m-ink)' : 'none',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '18px' }}>{['😌', '🙂', '😐', '😰', '😫'][level - 1]}</div>
                  <div style={{ fontSize: '11px' }}>{level}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '2px solid var(--m-ink)' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, marginBottom: '8px' }}>
              <span>Energy Level</span>
              <span style={{ color: 'var(--m-cyan)', fontWeight: 900 }}>{formData.energy} / 5</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleFormChange('energy', level)}
                  style={{
                    flex: 1,
                    padding: '10px 4px',
                    borderRadius: '10px',
                    border: '2px solid var(--m-ink)',
                    background: formData.energy === level ? 'var(--m-yellow)' : '#ffffff',
                    boxShadow: formData.energy === level ? '2px 2px 0px var(--m-ink)' : 'none',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '18px' }}>{['😴', '🥱', '😐', '😊', '🚀'][level - 1]}</div>
                  <div style={{ fontSize: '11px' }}>{level}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Exercise & Meditation */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '2px solid var(--m-ink)' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
              <span>Physical Movement / Exercise</span>
              <span style={{ color: 'var(--m-lime)', fontWeight: 900 }}>{formData.exercise} min</span>
            </label>
            <input
              type="range"
              min="0"
              max="180"
              step="5"
              value={formData.exercise}
              onChange={(e) => handleFormChange('exercise', parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--m-ink)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
        <button onClick={saveEntry} className="wellness-btn-primary" style={{ padding: '14px 36px', fontSize: '16px' }}>
          💾 Save Daily Check-in ➔
        </button>
      </div>
    </div>

    {/* Baseline Health Metrics */}
    <div className="wellness-card">
      <div className="wellness-section-heading">
        <span className="wellness-kicker">📏 PHYSICAL BASELINE</span>
        <h2>Body Metrics & BMI</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '2px solid var(--m-ink)' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>Weight (kg)</label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => handleFormChange('weight', parseFloat(e.target.value))}
            className="wellness-input"
          />
        </div>
        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '2px solid var(--m-ink)' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>Height (cm)</label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => handleFormChange('height', parseFloat(e.target.value))}
            className="wellness-input"
          />
        </div>
        {currentBMI && (
          <div style={{ background: 'var(--m-yellow)', padding: '14px', borderRadius: '14px', border: '2.5px solid var(--m-ink)', boxShadow: '3px 3px 0px var(--m-ink)', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Calculated BMI</span>
            <p style={{ fontSize: '32px', fontWeight: 950, margin: '4px 0 0' }}>{currentBMI.bmi}</p>
            <span style={{ fontSize: '13px', fontWeight: 900, color: 'var(--m-ink)' }}>{currentBMI.category}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Focus Mode Component
const FocusMode = ({ studyTimer, toggleTimer, resetTimer, startStudyTimer, formData }) => (
  <div className="space-y-6">
    <StudyTimerWidget
      studyTimer={studyTimer}
      toggleTimer={toggleTimer}
      resetTimer={resetTimer}
      startStudyTimer={startStudyTimer}
    />

    <div className="wellness-card">
      <div className="wellness-section-heading">
        <span className="wellness-kicker">💡 ACADEMIC FOCUS PROTOCOLS</span>
        <h2>High-Performance Study Principles</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '2px solid var(--m-ink)', boxShadow: '3px 3px 0px var(--m-ink)' }}>
          <h4 style={{ fontWeight: 900, fontSize: '14px', marginBottom: '6px' }}>📚 Active Recall Method</h4>
          <p style={{ fontSize: '12.5px', color: '#4b5569', fontWeight: 600 }}>Test yourself after every reading block instead of passively re-reading slides.</p>
        </div>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '2px solid var(--m-ink)', boxShadow: '3px 3px 0px var(--m-ink)' }}>
          <h4 style={{ fontWeight: 900, fontSize: '14px', marginBottom: '6px' }}>🎯 50-10 Rhythm</h4>
          <p style={{ fontSize: '12.5px', color: '#4b5569', fontWeight: 600 }}>Work 50 mins, then 10 mins screen-free walk. Protects mental stamina for finals.</p>
        </div>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '2px solid var(--m-ink)', boxShadow: '3px 3px 0px var(--m-ink)' }}>
          <h4 style={{ fontWeight: 900, fontSize: '14px', marginBottom: '6px' }}>🔕 Friction-Engineered Phone</h4>
          <p style={{ fontSize: '12.5px', color: '#4b5569', fontWeight: 600 }}>Leave your phone in a backpack or outside your study room to preserve cognitive bandwidth.</p>
        </div>
      </div>
    </div>
  </div>
);

// Goals & Habits Component
const GoalsAndHabits = ({ goals, habits, toggleHabit }) => (
  <div className="space-y-6">
    <div className="wellness-card">
      <div className="wellness-section-heading">
        <span className="wellness-kicker">🎯 PERSONAL MILESTONES</span>
        <h2>Academic & Health Goals</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div key={goal.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '2px solid var(--m-ink)', boxShadow: '3px 3px 0px var(--m-ink)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '14px', color: 'var(--m-ink)' }}>{goal.category}</strong>
              <span style={{ fontSize: '11px', fontWeight: 900, padding: '3px 8px', borderRadius: '6px', background: goal.isCompleted ? 'var(--m-cyan)' : 'var(--m-yellow)', border: '1.5px solid var(--m-ink)' }}>
                {goal.isCompleted ? 'Achieved ✦' : 'In Progress'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '10px' }}>{goal.goal}</p>
            <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '999px', border: '1.5px solid var(--m-ink)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%`, height: '100%', background: 'var(--m-blue)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', fontWeight: 800 }}>
              <span>{goal.progress.toFixed(1)} {goal.unit}</span>
              <span>Target: {goal.target} {goal.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    <HabitsTracker habits={habits} toggleHabit={toggleHabit} />
  </div>
);

// Insights Component
const Insights = ({ entries, chartData }) => (
  <div className="space-y-6">
    <div className="wellness-card">
      <div className="wellness-section-heading">
        <span className="wellness-kicker">📈 RETROSPECTIVE ANALYTICS</span>
        <h2>Your Weekly Academic Health Baseline</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div style={{ background: 'var(--m-yellow)', padding: '18px', borderRadius: '14px', border: '2.5px solid var(--m-ink)', boxShadow: '3px 3px 0px var(--m-ink)', textAlign: 'center' }}>
          <span style={{ fontSize: '32px' }}>{icons.mood}</span>
          <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '6px 0 2px' }}>Avg Mood</h4>
          <p style={{ fontSize: '28px', fontWeight: 950, margin: 0 }}>
            {entries.length > 0 ? (entries.reduce((sum, e) => sum + (moods.find((m) => m.label === e.mood)?.value || 0), 0) / entries.length).toFixed(1) : '0'} / 5
          </p>
        </div>
        <div style={{ background: 'var(--m-cyan)', padding: '18px', borderRadius: '14px', border: '2.5px solid var(--m-ink)', boxShadow: '3px 3px 0px var(--m-ink)', textAlign: 'center' }}>
          <span style={{ fontSize: '32px' }}>{icons.sleep}</span>
          <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '6px 0 2px' }}>Avg Sleep</h4>
          <p style={{ fontSize: '28px', fontWeight: 950, margin: 0 }}>
            {entries.length > 0 ? (entries.reduce((sum, e) => sum + e.sleep, 0) / entries.length).toFixed(1) : '0'} hrs
          </p>
        </div>
        <div style={{ background: 'var(--m-pink)', color: '#ffffff', padding: '18px', borderRadius: '14px', border: '2.5px solid var(--m-ink)', boxShadow: '3px 3px 0px var(--m-ink)', textAlign: 'center' }}>
          <span style={{ fontSize: '32px' }}>{icons.study}</span>
          <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '6px 0 2px' }}>Daily Study</h4>
          <p style={{ fontSize: '28px', fontWeight: 950, margin: 0 }}>
            {entries.length > 0 ? Math.floor(entries.reduce((sum, e) => sum + e.studyTime, 0) / entries.length / 60) : '0'}h avg
          </p>
        </div>
      </div>

      <WeeklyOverviewChart chartData={chartData} />
    </div>
  </div>
);

// Main Component
const MoodHealthTracker = () => {
  const today = new Date().toISOString().split('T')[0];

  // State Management
  const [entries, setEntries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formData, setFormData] = useState({
    date: today,
    mood: moods[3].label,
    sleep: 7.5,
    water: 4,
    exercise: 25,
    studyTime: 180,
    meditation: 10,
    weight: 68,
    height: 172,
    stressLevel: 2,
    energy: 4,
  });
  const [studyTimer, setStudyTimer] = useState({
    isActive: false,
    timeLeft: 25 * 60,
    sessionType: studySessionTypes[2],
    isBreak: false,
    completedSessions: 2,
  });
  const [quickActions, setQuickActions] = useState({
    waterGlasses: 4,
    moodCheckedToday: false,
    studySessionActive: false,
  });
  const [toasts, setToasts] = useState([]);

  // Toast Handler
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Initial Sample Setup
  useEffect(() => {
    if (entries.length === 0) {
      const sampleEntries = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          mood: moods[Math.floor(Math.random() * moods.length)].label,
          sleep: 6 + Math.random() * 3,
          water: Math.floor(Math.random() * 8) + 4,
          exercise: Math.floor(Math.random() * 45) + 15,
          studyTime: Math.floor(Math.random() * 180) + 120,
          stressLevel: Math.floor(Math.random() * 4) + 1,
          energy: Math.floor(Math.random() * 4) + 2,
        };
      });
      setEntries(sampleEntries);
    }
    if (goals.length === 0) {
      setGoals(
        goalTemplates.map((template, index) => ({
          id: index,
          ...template,
          progress: Math.random() * template.target,
          streak: Math.floor(Math.random() * 10) + 1,
          isCompleted: Math.random() > 0.4,
        }))
      );
    }
    if (habits.length === 0) {
      setHabits([
        { id: 1, name: 'Morning hydration & vitamins', completed: true, streak: 6 },
        { id: 2, name: '90-min Deep Study Block', completed: true, streak: 4 },
        { id: 3, name: 'Post-study desk stretch & 20-20-20 eye rest', completed: false, streak: 3 },
        { id: 4, name: 'Evening sleep wind-down (no screens 30m)', completed: false, streak: 8 },
      ]);
    }
  }, [entries.length, goals.length, habits.length]);

  // Pomodoro Study Timer Logic
  useEffect(() => {
    let interval = null;
    if (studyTimer.isActive && studyTimer.timeLeft > 0) {
      interval = setInterval(() => {
        setStudyTimer((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else if (studyTimer.timeLeft === 0) {
      setStudyTimer((prev) => ({
        ...prev,
        isActive: false,
        isBreak: !prev.isBreak,
        timeLeft: prev.isBreak ? prev.sessionType.duration * 60 : prev.sessionType.break * 60,
        completedSessions: prev.isBreak ? prev.completedSessions + 1 : prev.completedSessions,
      }));
      if (studyTimer.isBreak) {
        addToast(`🎉 Conquered ${studyTimer.sessionType.type} session! Take a break.`, 'success');
      }
    }
    return () => clearInterval(interval);
  }, [studyTimer.isActive, studyTimer.timeLeft, studyTimer.isBreak, studyTimer.sessionType]);

  // Habit toggler
  const toggleHabit = (habitId) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              completed: !habit.completed,
              streak: !habit.completed ? habit.streak + 1 : Math.max(0, habit.streak - 1),
            }
          : habit
      )
    );
    const habit = habits.find((h) => h.id === habitId);
    addToast(`${habit?.name} ${!habit?.completed ? 'completed! ⭐' : 'unmarked'}`, 'success');
  };

  // Water increment
  const addWaterGlass = () => {
    setQuickActions((prev) => ({
      ...prev,
      waterGlasses: prev.waterGlasses + 1,
    }));
    setFormData((prev) => ({
      ...prev,
      water: prev.water + 1,
    }));
    addToast('Hydration +1 logged! 💧 Stay sharp!', 'info');
  };

  // Timer Handlers
  const startStudyTimer = (sessionType) => {
    setStudyTimer({
      isActive: true,
      timeLeft: sessionType.duration * 60,
      sessionType,
      isBreak: false,
      completedSessions: studyTimer.completedSessions,
    });
  };

  const toggleTimer = () => {
    setStudyTimer((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  const resetTimer = () => {
    setStudyTimer({
      isActive: false,
      timeLeft: studyTimer.sessionType.duration * 60,
      sessionType: studyTimer.sessionType,
      isBreak: false,
      completedSessions: studyTimer.completedSessions,
    });
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveEntry = () => {
    const existingIndex = entries.findIndex((e) => e.date === formData.date);
    const newEntry = {
      ...formData,
      sleep: Number(formData.sleep),
      water: Number(formData.water),
      exercise: Number(formData.exercise),
      studyTime: Number(formData.studyTime),
      meditation: Number(formData.meditation),
      weight: Number(formData.weight),
      height: Number(formData.height),
      stressLevel: Number(formData.stressLevel),
      energy: Number(formData.energy),
    };
    if (existingIndex >= 0) {
      const updated = [...entries];
      updated[existingIndex] = newEntry;
      setEntries(updated);
      addToast("Today's check-in updated! ⚡", 'success');
    } else {
      setEntries([...entries, newEntry]);
      addToast("Today's wellness log saved! 🚀", 'success');
    }
  };

  // Chart preparation
  const chartData = entries
    .slice(0, 7)
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
      mood: moods.find((m) => m.label === entry.mood)?.value || 3,
      sleep: entry.sleep,
      water: entry.water,
      exercise: entry.exercise,
      studyTime: entry.studyTime / 60,
      stress: entry.stressLevel,
      energy: entry.energy,
    }))
    .reverse();

  const currentBMI = calculateBMI(formData.weight, formData.height);

  return (
    <div className="wellness-page">
      {/* Background Floating Orbs */}
      <div className="wellness-orb wellness-orb-1" aria-hidden="true" />
      <div className="wellness-orb wellness-orb-2" aria-hidden="true" />
      <div className="wellness-orb wellness-orb-3" aria-hidden="true" />

      {/* Floating Retro Stickers */}
      <div className="wellness-sticker wellness-sticker-tl" aria-hidden="true">
        <span>⚡</span> 100% FOCUS FLOW
      </div>
      <div className="wellness-sticker wellness-sticker-tr" aria-hidden="true">
        <span>🧠</span> ZERO BURNOUT ZONE
      </div>
      <div className="wellness-sticker wellness-sticker-br" aria-hidden="true">
        <span>💧</span> HYDRATE OR DIEDRATE
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Maximalist Header */}
        <header className="wellness-page-heading">
          <div>
            <span className="wellness-kicker">
              <span>✦</span> STUDENT WELLNESS & FOCUS LAB
            </span>
            <h1>
              Nourish Your Brain.<br />
              <span>Crush Your Goals.</span>
            </h1>
            <p>
              Burnout prevention, generative Lo-Fi soundscapes, and science-backed focus rhythms engineered for high-performing students.
            </p>
          </div>
          <div className="wellness-heading-art" aria-hidden="true">
            <span>☀</span>
            <i>✦</i>
            <b>⚡</b>
          </div>
        </header>

        {/* Maximalist Navigation */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <StudyTimerWidget
              studyTimer={studyTimer}
              toggleTimer={toggleTimer}
              resetTimer={resetTimer}
              startStudyTimer={startStudyTimer}
            />
            <QuickStats
              formData={formData}
              quickActions={quickActions}
              studyTimer={studyTimer}
              goals={goals}
            />
            <QuickActions
              addWaterGlass={addWaterGlass}
              setActiveTab={setActiveTab}
              quickActions={quickActions}
            />
            <HabitsTracker habits={habits} toggleHabit={toggleHabit} />
            <WeeklyOverviewChart chartData={chartData} />
          </div>
        )}

        {activeTab === 'focus' && (
          <FocusMode
            studyTimer={studyTimer}
            toggleTimer={toggleTimer}
            resetTimer={resetTimer}
            startStudyTimer={startStudyTimer}
            formData={formData}
          />
        )}

        {activeTab === 'destress' && (
          <DestressAndSoundLab formData={formData} addToast={addToast} />
        )}

        {activeTab === 'tracker' && (
          <DailyTracker
            formData={formData}
            handleFormChange={handleFormChange}
            saveEntry={saveEntry}
            currentBMI={currentBMI}
            today={today}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsAndHabits goals={goals} habits={habits} toggleHabit={toggleHabit} />
        )}

        {activeTab === 'insights' && (
          <Insights entries={entries} chartData={chartData} />
        )}

        {/* Toast notifications */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  );
};

export default MoodHealthTracker;