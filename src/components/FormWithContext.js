/** @format */

import React from 'react';

import useForm from 'hooks/useForm';
import FormContext from 'contexts/FormContext';

function FormWithContext ({ children, options }) {
  const values = useForm(options);

  return <FormContext.Provider value={values}>{children}</FormContext.Provider>;
}

export default React.memo(FormWithContext);
