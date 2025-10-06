const initialState = {
  selectedProject: {
    project_id: null,
    profile_picture: null,
    project_name: null,
    saved_at: null
  }
};

export const imagestore = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_SELECTED_PROJECT':
      return {
        ...state,
        selectedProject: action.payload
      };
    case 'CLEAR_SELECTED_PROJECT':
      return {
        ...state,
        selectedProject: initialState.selectedProject
      };
    default:
      return state;
  }
};