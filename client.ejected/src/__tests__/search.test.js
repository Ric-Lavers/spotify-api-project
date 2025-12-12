import React from 'react'
import ReactDOM from 'react-dom'

import { render, fireEvent } from 'react-testing-library'

import Search from '../components/Player/Search'

describe.skip('search', () => {
  test('should not search if input length is zero', () => {
      const form = render( <Search/> )
      const input = form.getByLabelText('search-input')
      fireEvent.change( input, {target: { value: "cat"}} )
      expect( input.value ).toBe( 'cat' )
    }
  )
  it.skip('should clear search onSubmit', () => {
    const { getByAltText, getByLabelText } = render( <Search query={{searchText: "valid", type: 'artist'}}/> )
    const submit = getByAltText('submit')
    const input = getByLabelText('search-input')
    expect(input.value).toBe("valid")
    fireEvent.click(input)
    expect(input.value).toBe("")
  })
  it.skip('should not search if object is incomplete', () => {
    const { getByAltText } = render( <Search query={{searchText: "valid", type: undefined}}/> )
    const submit = getByAltText('submit')
    fireEvent.click()
    expect()
  })
})