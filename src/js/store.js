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
    async fetchData({ dispatch }) {
      try {
        const remoteResult = await fetch(remoteDataURL, {
          headers: {

            'X-Access-Key': remoteDataAPIKey,
            'X-Bin-Meta': true,
          }

        });

        if (!remoteResult.ok) {
          console.error('getting gist data error:', await remoteResult.text());
          throw new Error(`getting gist HTTP error! Status: ${remoteResult.status}`);
        }



        const remoteAlbums = (await remoteResult.json()).record;
        const localData = JSON.parse(localStorage.getItem(localStorageKey)) || {};


        // Compare timestamps and update local storage if needed
        if (!localData.lastModified || new Date(remoteAlbums.lastModified) > new Date(localData.lastModified)) {
          localStorage.setItem(localStorageKey, JSON.stringify(remoteAlbums));
          console.log('Local storage updated with data from Gist.');
          dispatch('loadLocalStorage'); // Refresh the state
        }
      } catch (error) {
        console.error('Error syncing data:', error);
        // Fallback: Load from local storage
        dispatch('loadLocalStorage');
      }
    },
  },
});

export default store;
