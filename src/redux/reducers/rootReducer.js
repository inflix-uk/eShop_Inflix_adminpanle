import { combineReducers } from "redux";
import authSlice from "./authSlice";
import blogsReducer from "./blogsSlice";
import registerReducer from "./registerSlice";
const rootReducer = combineReducers({
  auth: authSlice,
  blogs: blogsReducer,
  register: registerReducer,
});

export default rootReducer;
