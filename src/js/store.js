import { createStore } from 'framework7';
import githubConfig from '../github.config'; // Default import

const gistUrl = githubConfig.gistURL;
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
    async fetchData({ state }) {
      try {
        const response = await fetch(gistUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const remoteData = await response.json();

        // Update local storage if the Gist data is newer
        const localData = JSON.parse(localStorage.getItem(localStorageKey)) || {};
        if (!localData.lastModified || new Date(remoteData.lastModified) > new Date(localData.lastModified)) {
          localStorage.setItem(localStorageKey, JSON.stringify(remoteData));
          console.log('Local storage updated with data from Gist.');
        }

        // Update state
        state.albums = remoteData.albums;
        state.authors = remoteData.authors;
        state.ratings = remoteData.ratings;
        state.lastModified = remoteData.lastModified;
      } catch (error) {
        console.error('Error fetching data:', error);
        // If offline, load from localStorage
        const localData = JSON.parse(localStorage.getItem(localStorageKey)) || {};
        state.albums = localData.albums || [];
        state.authors = localData.authors || [];
        state.ratings = localData.ratings || [];
        state.lastModified = localData.lastModified || null;
        console.log('Using local storage data due to fetch error.');
      }
    },
  },
});

export default store;
