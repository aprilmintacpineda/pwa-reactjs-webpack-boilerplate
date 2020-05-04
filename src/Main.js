/** @format */

import React from 'react';
import useFluxibleStore from 'react-fluxible/lib/useFluxibleStore';
import { updateStore } from 'fluxible-js';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';

import PlusOneIcon from '@material-ui/icons/PlusOne';
import ExposureNeg1Icon from '@material-ui/icons/ExposureNeg1';

function mapStates (states) {
  return {
    authUser: states.authUser
  };
}

function Main () {
  const { authUser } = useFluxibleStore(mapStates);
  const [count, setCount] = React.useState(0);

  const increment = React.useCallback(() => {
    setCount(count => count + 1);
  }, []);

  const decrement = React.useCallback(() => {
    setCount(count => count - 1);
  }, []);

  const onNameChange = React.useCallback(
    ev => {
      updateStore({
        authUser: {
          ...authUser,
          name: ev.target.value
        }
      });
    },
    [authUser]
  );

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" mt={10}>
      <Typography variant="h2">{authUser.name}</Typography>
      <Box mb={2}>
        <Typography>Change your name</Typography>
        <TextField
          variant="outlined"
          margin="dense"
          onChange={onNameChange}
          value={authUser.name}
        />
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Typography>Count: {count}</Typography>
        <Box ml={2}>
          <IconButton size="small" onClick={increment}>
            <PlusOneIcon />
          </IconButton>
          <IconButton size="small" onClick={decrement}>
            <ExposureNeg1Icon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default React.memo(Main);
