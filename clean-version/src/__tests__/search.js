import React from 'react';
import { render, fireEvent } from 'react-testing-library'

import Search from '../components/Player/Search'

describe('search', () => {
  test('should not search if input length is zero', () => {
      const form = render( <Search/> )
      const input = form.getByLabelText('search-input')
      fireEvent.change( input, {target: { value: "cat"}} )
      expect( input.value ).toBe( 'cat' )
    }
  )
})