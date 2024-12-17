import { createStore } from 'framework7';
import remotedataConfig from '../remoteStorage.config';


const { dataUrl: remoteDataURL, apiKey: remoteDataAPIKey } = remotedataConfig;

const localStorageKey = 'iAlbumsData';

const store = createStore({
  state: {
    albums: [],
    authors: [],
    ratings: [],
    lastModified: null,
  },
  getters: {
    albums({ state }) {
      return state.albums;
    },
    authors({ state }) {
      return state.authors;
    },
    ratings({ state }) {
      return state.ratings;
    },
  },
  actions: {
    // Adds a brand new album
    addAlbum({ state, dispatch }, newAlbum) {
      state.albums.push(newAlbum);
      state.lastModified = new Date().toISOString();
      localStorage.setItem(localStorageKey, JSON.stringify(state));
      // Attempt to push to remote
      dispatch('pushData');
    },
    updateAlbum({ state, dispatch }, updatedAlbum) {
      const albumIndex = state.albums.findIndex(a => a.id === updatedAlbum.id);
      if (albumIndex !== -1) {
        state.albums[albumIndex] = { ...state.albums[albumIndex], ...updatedAlbum };
        state.lastModified = new Date().toISOString();
        localStorage.setItem(localStorageKey, JSON.stringify(state));
        // Attempt to push to remote
        dispatch('pushData');
      }
    },
    addAuthor({ state }, newAuthor) {
      state.authors.push(newAuthor);
      state.lastModified = new Date().toISOString();
      localStorage.setItem(localStorageKey, JSON.stringify(state));
      // optional: we can push data here, too, or just wait until album is saved
    },
    addRating({ state }, rating) {
      // only add if not already in list
      if (!state.ratings.includes(rating)) {
        state.ratings.push(rating);
        state.lastModified = new Date().toISOString();
        localStorage.setItem(localStorageKey, JSON.stringify(state));
      }
    },
    loadLocalStorage({ state }) {
      const localData = JSON.parse(localStorage.getItem(localStorageKey)) || {};
      state.albums = localData.albums || [];
      state.authors = localData.authors || [];
      state.ratings = localData.ratings || [];
      state.lastModified = localData.lastModified || null;
    },
    saveToLocalStorage({ state }) {
      const dataToSave = {
        albums: state.albums,
        authors: state.authors,
        ratings: state.ratings,
        lastModified: new Date().toISOString(),
      };
      localStorage.setItem(localStorageKey, JSON.stringify(dataToSave));
    },
    async fetchData({ dispatch, state }) {
      try {
        const remoteResult = await fetch(remoteDataURL, {
          headers: {
            'X-Access-Key': remoteDataAPIKey,
            'X-Bin-Meta': true,
          },
        });
        if (!remoteResult.ok) {
          throw new Error(`HTTP error! Status: ${remoteResult.status}`);
        }
        const { record: remoteAlbums } = await remoteResult.json();

        const localData = JSON.parse(localStorage.getItem(localStorageKey)) || {};

        // Compare timestamps
        const remoteTime = remoteAlbums.lastModified ? new Date(remoteAlbums.lastModified) : 0;
        const localTime = localData.lastModified ? new Date(localData.lastModified) : 0;

        if (remoteTime > localTime) {
          // Remote is newer, so overwrite local
          localStorage.setItem(localStorageKey, JSON.stringify(remoteAlbums));
          dispatch('loadLocalStorage');
        } else if (localTime > remoteTime) {
          // Local is newer, push to remote
          dispatch('pushData');
        } else {
          // They are same or no data... just load local
          dispatch('loadLocalStorage');
        }
      } catch (error) {
        console.error('Error syncing data:', error);
        // fallback to local
        dispatch('loadLocalStorage');
      }
    },

    async pushData({ state }) {
      try {
        // push (PUT) the entire state back to JSONBIN
        const response = await fetch(remoteDataURL, {
          method: 'PUT', 
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Key': remoteDataAPIKey,
          },
          body: JSON.stringify({
            albums: state.albums,
            authors: state.authors,
            ratings: state.ratings,
            lastModified: state.lastModified
          }),
        });
        if (!response.ok) {
          console.error('Failed to push data to remote:', response.statusText);
        } else {
          console.log('Local data successfully pushed to remote JSONBIN');
        }
      } catch (err) {
        console.error('pushData error:', err);
      }
    },
    
  },
});

export default store;
