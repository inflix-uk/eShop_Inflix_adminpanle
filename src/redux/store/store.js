// store.js
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../reducers/rootReducer';
import PersistConfig from './PersistConfig';
import { persistStore, persistReducer } from 'redux-persist';

const persistedReducer = persistReducer(PersistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

const persistor = persistStore(store);

export { store, persistor };
