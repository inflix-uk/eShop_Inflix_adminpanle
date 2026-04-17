import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const PersistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth',], // only persist the auth reducer
};

export default PersistConfig;