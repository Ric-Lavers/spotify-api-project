import React from 'react'
import { testHook, act, cleanup } from 'react-testing-library'

import { useToggle } from '../hooks/index.js'
import {useHandleChange} from '../hooks/index'

describe('useToggle', () => {
  test('accepts default values', () => {
    let toggleValue
    testHook(() => (toggleValue = useToggle(false)[0]))

    expect(toggleValue).toBe(false)
  })

  test('should be able to toggle value  muliple times', () => {
    let value, toggler
    testHook(() => {
      [value, toggler] = useToggle(false)
    })
    act(toggler)
    act(toggler)
    act(toggler)

    expect(value).toBe(true)
  })
})

describe('useHandleChange', () => {
 
  test('should intialise state', () => {
    let formState
    const initalState = {firstName: 'mr', lastName: 'name'}
    testHook(() => {
      [formState] = useHandleChange(initalState)
    })
    
    
    expect(formState).toBe(initalState)
  })
  test('should update from name & value form event target', () => {
    let formState, handleChange
    const initalState = {firstName: 'mr', lastName: 'name'}
    testHook(() => {
      [formState, handleChange] = useHandleChange(initalState)
    })
    act( () => {
      handleChange( {target:{name: 'anotherField', value: 'testing'}} )
    })
    expect(formState).toEqual(
      expect.objectContaining({ anotherField: 'testing' })
    )
  })
  test('checkbox input should convert checked to boolean value', () => {
    let formState, handleChange
    const initalState = {firstName: 'mr', lastName: 'name'}
    testHook(() => {
      [formState, handleChange] = useHandleChange(initalState)
    })
    act( () => {
      handleChange( {target:{name: 'checkboxTest', type: 'checkbox', checked: true}} )
    })
    expect(formState.checkboxTest).toBe(true)
  })
})
