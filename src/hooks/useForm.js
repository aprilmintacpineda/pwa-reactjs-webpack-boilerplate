/** @format */

import React from 'react';

import { xhr, xhrWithFile } from '../libs/fetch';

function useForm ({
  initialValues,
  validators,
  apiEndpoint,
  afterSubmit,
  beforeSubmit,
  method,
  withFile
}) {
  const initialFormValues = React.useRef(initialValues);
  const formValidators = React.useRef(validators || {});

  const [{ formValues, formErrors, status }, setState] = React.useState(() => ({
    formValues: { ...initialFormValues.current },
    formErrors: {},
    status: 'initial'
  }));

  const submitting = status === 'submitting';

  const setValue = React.useCallback((name, value) => {
    setState(oldState => {
      const errors = { ...oldState.formErrors };
      const values = {
        ...oldState.formValues,
        [name]: value
      };

      const validator = formValidators.current[name];
      if (validator) errors[name] = validator(values);

      return {
        ...oldState,
        formValues: values,
        formErrors: errors
      };
    });
  }, []);

  const validateForm = React.useCallback(() => {
    const errors = {};
    let hasError = false;

    Object.keys(formValues).forEach(field => {
      const validator = formValidators.current[field];
      if (!validator) return;
      const error = validator(formValues);
      if (!error) return;
      hasError = true;
      errors[field] = error;
    });

    if (hasError) {
      setState(oldState => ({
        ...oldState,
        formErrors: errors
      }));

      return true;
    }

    return false;
  }, [formValues]);

  const onSubmit = React.useCallback(async () => {
    if (submitting) return;

    setState(oldState => ({
      ...oldState,
      status: 'submitting'
    }));

    if (validateForm()) {
      setState(oldState => ({
        ...oldState,
        status: 'validationError'
      }));

      return;
    }

    if (beforeSubmit) beforeSubmit(formValues);

    try {
      const xhrAgent = withFile ? xhrWithFile : xhr;

      const response = await xhrAgent(apiEndpoint, {
        method,
        body: formValues
      });

      setState(oldState => ({
        ...oldState,
        status: 'submitSuccess'
      }));

      if (afterSubmit) afterSubmit(response, 'success');
    } catch (error) {
      setState(oldState => ({
        ...oldState,
        status: 'submitError'
      }));

      if (afterSubmit) afterSubmit(error, 'error');
    }
  }, [
    validateForm,
    formValues,
    apiEndpoint,
    withFile,
    method,
    afterSubmit,
    beforeSubmit,
    submitting
  ]);

  return React.useMemo(
    () => ({
      formValues,
      formErrors,
      setValue,
      onSubmit,
      status,
      submitting
    }),
    [formValues, formErrors, setValue, onSubmit, status, submitting]
  );
}

export default useForm;
