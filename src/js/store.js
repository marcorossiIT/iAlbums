import { createStore } from 'framework7';
import remotedataConfig from '../remoteStorage.config';
import crypto from 'crypto';


const { dataUrl: remoteDataURL, apiKey: remoteDataAPIKey } = remotedataConfig;


// ====== MOCK DATA ===== //
const mockData = JSON.parse(`{
  "albums": {
    "h9dc9hds": {
      "title": "album11",
      "authors": [
        "Black Country",
        "New Road"
      ],
      "year": 1966,
      "genre": "Rock",
      "rating": "good",
      "notes": "bla bla bla bla bla blab llaa",
      "standouts": "2024"
    },
    "bj43kk34bk": {
      "title": "Little Electric Chicken Heart",
      "authors": [
        "Ana Frango Electrico"
      ],
      "year": 2024,
      "genre": "POP/LATIN POP/HIP HOP",
      "rating": "good",
      "notes": "bla bla bla bla bla blab llaa",
      "standouts": "2024"
    }
  },
  "lastModified": "2024-12-17T17:08:19.551Z"
}`);
const baseAlbum = {
  "title": null,
  "authors": null,
  "year": null,
  "genre": null,
  "rating": null,
  "notes": null,
  "standouts": null
}


const store = createStore({
  state: {
    albums: {},
    lastModified: 0,
  },
  getters: {
    albums({ state }) {
      return state.albums;
    },

  },
  actions: {
    // Adds a brand new album
    addAlbum({ state, dispatch }, newAlbum) {


      // prepare data
      //   prepare album
      let newAlbumDetails = {
        title: newAlbum?.title || null,
        authors: newAlbum?.authors || null,
        year: newAlbum?.year || null,
        genre: newAlbum?.genre || null,
        rating: newAlbum?.rating || null,
        notes: newAlbum?.notes || null,
        standouts: newAlbum?.standouts || null
      };

      // update local
      //   edit last edit time
      state.lastModified = new Date().toISOString();
      //   add album
      state.albums[crypto.createHash('sha1').update(JSON.stringify(newAlbum)).digest('hex')] = newAlbumDetails;

      // optional check last edit time per conflitti 

      // send data online
      dispatch('updateRemote');

    },
    updateAlbum({ state, dispatch }, updatedAlbum) {

      // prepare data
      //   prepare album
      let uppedAlbumDetails = {
        title: updatedAlbum?.title || null,
        authors: updatedAlbum?.authors || null,
        year: updatedAlbum?.year || null,
        genre: updatedAlbum?.genre || null,
        rating: updatedAlbum?.rating || null,
        notes: updatedAlbum?.notes || null,
        standouts: updatedAlbum?.standouts || null
      };

      // update local
      //   edit last edit time
      state.lastModified = new Date().toISOString();
      //   update album
      state.albums[updatedAlbum.id] = uppedAlbumDetails;

      // optional check last edit time per conflitti

      // send data online
      dispatch('updateRemote');


    },

    async updateRemote({ state }) {
      try {
        const payload = {
          albums: state.albums,
          lastModified: state.lastModified
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


      } catch (error) {
        console.error('Error pushing data:', error);
      }
    },

    async getRemote({ state }) {
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
        state.albums = { ...remoteAlbums.albums }


      } catch (error) {
        console.error('Error fetching remote data:', error);
        $f7.toast.create({ text: 'Error with remote sync!', closeTimeout: 2000 }).open();

      }
    },


  },
});

export { mockData }
export default store;