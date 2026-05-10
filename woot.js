(() => {
  const api = window.WavezFM;

  if (!api || api.version !== '1') {
    console.warn('WavezFM bridge unavailable');
    return;
  }

  let lastPlaybackKey = null;

  const voteForCurrentTrack = () => {
    const state = api.room.getState();
    const playback = state?.playback;

    if (!playback) return;

    if (playback.playbackKey === lastPlaybackKey) return;

    lastPlaybackKey = playback.playbackKey;

    if (!state.votes.canVote) return;

    const result = api.actions.vote('woot');
    console.log('AutoWoot result:', result);
  };

  voteForCurrentTrack();

  api.room.subscribe('playback_changed', voteForCurrentTrack);
})();
