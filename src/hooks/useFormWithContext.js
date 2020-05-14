/** @format */

import React from 'react';

import FormContext from 'contexts/FormContext';

function useFormWithContext () {
  return React.useContext(FormContext);
}

export default useFormWithContext;
