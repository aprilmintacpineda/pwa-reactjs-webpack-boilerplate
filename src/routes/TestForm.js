/** @format */

import React from 'react';

import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import useForm from 'hooks/useForm';
import validate from 'libs/validations';

const options = {
  initialValues: {
    title: '',
    body: ''
  },
  validators: {
    title: ({ title }) => validate(title, ['required', 'maxLength:10']),
    body: ({ body }) => validate(body, ['required', 'maxLength:20'])
  },
  apiEndpoint: 'https://jsonplaceholder.typicode.com/posts',
  method: 'post',
  afterSubmit: (response, status) => {
    console.log('TestForm afterSubmit', response, status);
  },
  beforeSubmit: formValues => {
    console.log('beforeSubmit', formValues);
  }
};

function TestForm () {
  const { formValues, formErrors, setValue, onSubmit, submitting } = useForm(options);

  const onTitleChange = React.useCallback(
    ev => {
      setValue('title', ev.target.value);
    },
    [setValue]
  );

  const onBodyChange = React.useCallback(
    ev => {
      setValue('body', ev.target.value);
    },
    [setValue]
  );

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" mt={10}>
      <Box display="flex" flexDirection="column">
        <TextField
          title="Title"
          placeholder="Title of post"
          value={formValues.title}
          onChange={onTitleChange}
          variant="outlined"
          margin="dense"
          error={Boolean(formErrors.title)}
          disabled={submitting}
        />
        {formErrors.title ? <Typography color="error">{formErrors.title}</Typography> : null}
      </Box>
      <Box display="flex" flexDirection="column">
        <TextField
          multiline
          title="Body"
          placeholder="Body of post"
          value={formValues.body}
          onChange={onBodyChange}
          variant="outlined"
          margin="dense"
          error={Boolean(formErrors.body)}
          disabled={submitting}
        />
        {formErrors.body ? <Typography color="error">{formErrors.body}</Typography> : null}
      </Box>
      <Button variant="outlined" color="primary" onClick={onSubmit}>
        Post
      </Button>
    </Box>
  );
}

export default React.memo(TestForm);
