import React, { useState, useCallback, useEffect, Component } from 'react'

import {
	useWindowWidth,
	withWindowWidth,
	WindowWidthWrapper,
	useColorOnInput,
} from './demoHooks'

import {
	useToggle,
	useHandleChange,
	useFlash,
} from './commonHooks'

export {
	useToggle,
	useHandleChange,
	useFlash,
	/* these aren;t used in the app */
	// useWindowWidth,
	// withWindowWidth,
	// WindowWidthWrapper,
	// useColorOnInput,
}