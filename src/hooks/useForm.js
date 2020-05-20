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

  const setForm = React.useCallback((values, errors) => {
    setState(oldState => {
      let newValues = values;
      let newErrors = errors;

      if (values.constructor === Function) {
        const { formValues, formErrors } = values(oldState.formValues);
        newValues = formValues;
        newErrors = formErrors;
      }

      return {
        ...oldState,
        formValues: {
          ...oldState.formValues,
          ...newValues
        },
        formErrors: {
          ...oldState.formErrors,
          ...newErrors
        }
      };
    });
  }, []);

  const setValue = React.useCallback((name, value) => {
    setState(oldState => {
      const newFormErrors = { ...oldState.formErrors };
      const updatedValues =
        name.constructor === Function ? name(oldState.formValues) : { [name]: value };
      const newFormValues = {
        ...oldState.formValues,
        ...updatedValues
      };

      Object.keys(updatedValues).forEach(key => {
        const validator = formValidators.current[key];
        if (validator) newFormErrors[key] = validator(newFormValues);
      });

      return {
        ...oldState,
        formValues: newFormValues,
        formErrors: newFormErrors
      };
    });
  }, []);

  const validateFields = React.useCallback(
    fields => {
      const errors = {};
      let hasError = false;

      fields.forEach(field => {
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
      }

      return hasError;
    },
    [formValues]
  );

  const validateForm = React.useCallback(() => {
    return validateFields(Object.keys(formValues));
  }, [formValues, validateFields]);

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
      setForm,
      onSubmit,
      status,
      submitting,
      validateFields
    }),
    [formValues, formErrors, setValue, setForm, onSubmit, status, submitting, validateFields]
  );
}

export default useForm;
