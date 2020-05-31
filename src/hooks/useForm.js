/** @format */

import React from 'react';

import { xhr, xhrWithFile } from '../libs/fetch';

function useForm ({
  initialValues,
  validators = {},
  apiEndpoint,
  afterSubmit,
  beforeSubmit,
  method,
  withFile,
  initialContext = null,
  callbacks = {},
  transformFormBody
}) {
  const initialFormContext = React.useRef(initialContext);
  const initialFormValues = React.useRef(initialValues);
  const formValidators = React.useRef(validators);

  const [{ formValues, formErrors, status, formContext }, setState] = React.useState(() => ({
    formValues: { ...initialFormValues.current },
    formErrors: {},
    formContext: { ...initialFormContext.current },
    status: 'initial'
  }));

  const submitting = status === 'submitting';

  const clearForm = React.useCallback(() => {
    if (submitting) return;

    setState({
      formValues: { ...initialFormValues.current },
      formErrors: {},
      formContext: { ...initialFormContext.current }
    });
  }, [submitting]);

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

  const setContext = React.useCallback((name, value) => {
    setState(oldState => {
      const newContext =
        name.constructor === Function
          ? name({
              formContext: oldState.formContext,
              formValues: oldState.formValues,
              formErrors: oldState.formErrors
            })
          : { [name]: value };

      return {
        ...oldState,
        formContext: {
          ...oldState.formContext,
          ...newContext
        }
      };
    });
  }, []);

  const setValue = React.useCallback((name, value) => {
    setState(oldState => {
      const nameConstructor = name.constructor;
      const updatedValues =
        nameConstructor === Function
          ? name(oldState.formValues)
          : nameConstructor === Object
          ? name
          : { [name]: value };
      const newFormErrors = { ...oldState.formErrors };
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

    if (beforeSubmit) beforeSubmit({ formValues, formContext });

    let formBody = formValues;
    if (transformFormBody) formBody = transformFormBody({ formValues, formContext });

    try {
      const xhrAgent = withFile ? xhrWithFile : xhr;

      const response = await xhrAgent(apiEndpoint, {
        method,
        body: formBody
      });

      setState(oldState => ({
        ...oldState,
        status: 'submitSuccess'
      }));

      if (afterSubmit) afterSubmit(null, response);
    } catch (error) {
      setState(oldState => ({
        ...oldState,
        status: 'submitError'
      }));

      if (afterSubmit) afterSubmit(error, null);
    }
  }, [
    validateForm,
    formValues,
    apiEndpoint,
    withFile,
    method,
    afterSubmit,
    beforeSubmit,
    submitting,
    formContext,
    transformFormBody
  ]);

  const callbackFns = React.useMemo(() => {
    return Object.keys(callbacks).reduce((accumulator, current) => {
      accumulator[current] = (...args) => {
        callbacks[current](
          {
            formValues,
            formErrors,
            setValue,
            setForm,
            onSubmit,
            status,
            submitting,
            validateFields,
            formContext,
            setContext,
            clearForm
          },
          ...args
        );
      };

      return accumulator;
    }, {});
  }, [
    callbacks,
    formValues,
    formErrors,
    setValue,
    setForm,
    onSubmit,
    status,
    submitting,
    validateFields,
    formContext,
    setContext,
    clearForm
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
      validateFields,
      formContext,
      setContext,
      clearForm,
      callbacks: {
        ...callbackFns
      }
    }),
    [
      formValues,
      formErrors,
      setValue,
      setForm,
      onSubmit,
      status,
      submitting,
      validateFields,
      formContext,
      setContext,
      callbackFns,
      clearForm
    ]
  );
}

export default useForm;
