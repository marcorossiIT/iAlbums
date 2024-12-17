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
      dispatch('saveToLocalStorage');
      dispatch('pushData');
    }, updateAlbum({ state, dispatch }, updatedAlbum) {
      const albumIndex = state.albums.findIndex((a) => a.id === updatedAlbum.id);
      if (albumIndex !== -1) {
        state.albums[albumIndex] = { ...state.albums[albumIndex], ...updatedAlbum };
        state.lastModified = new Date().toISOString();
        dispatch('saveToLocalStorage');
        dispatch('pushData');
      }
    },

    addAuthor({ state, dispatch }, newAuthor) {
      state.authors.push(newAuthor);
      state.lastModified = new Date().toISOString();
      dispatch('saveToLocalStorage');
      dispatch('pushData');
    },

    addRating({ state, dispatch }, rating) {
      if (!state.ratings.includes(rating)) {
        state.ratings.push(rating);
        state.lastModified = new Date().toISOString();
        dispatch('saveToLocalStorage');
        dispatch('pushData');
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
        lastModified: state.lastModified || new Date().toISOString(),
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

        const remoteTime = remoteAlbums.lastModified ? new Date(remoteAlbums.lastModified) : 0;
        const localTime = localData.lastModified ? new Date(localData.lastModified) : 0;

        if (remoteTime > localTime) {
          // Remote data is newer; use it
          localStorage.setItem(localStorageKey, JSON.stringify(remoteAlbums));
          dispatch('loadLocalStorage');
        } else if (localTime > remoteTime) {
          // Local data is newer; push it
          dispatch('pushData');
        } else {
          // Both are same or no data, load local
          dispatch('loadLocalStorage');
        }
      } catch (error) {
        console.error('Error fetching remote data:', error);
        dispatch('loadLocalStorage');
      }
    },

    async pushData({ state }) {
      try {
        const payload = {
          albums: state.albums,
          authors: state.authors,
          ratings: state.ratings,
          lastModified: new Date().toISOString(),
        };

        const response = await fetch(remoteDataURL, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Key': remoteDataAPIKey,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to push data to remote');
        }

        console.log('Data successfully pushed to remote');
        localStorage.setItem(localStorageKey, JSON.stringify(payload));
        state.lastModified = payload.lastModified;
      } catch (error) {
        console.error('Error pushing data:', error);
      }
    },

  },
});

export default store;
