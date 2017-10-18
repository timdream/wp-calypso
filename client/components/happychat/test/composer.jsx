/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { Composer } from '../composer';

describe( '<Composer />', () => {
	describe( 'onChange event ', () => {
		test( 'should call onSetMessage property and send a typing event if message is not empty', () => {
			const onSendNotTyping = jest.fn();
			const onSendTyping = jest.fn();
			const onSetMessage = jest.fn();
			const wrapper = shallow(
				<Composer
					message={ 'hey' }
					onSetMessage={ onSetMessage }
					onSendTyping={ onSendTyping }
					onSendNotTyping={ onSendNotTyping }
				/>
			);
			wrapper.find( 'textarea' ).simulate( 'change', { target: { value: 'hey' } } );
			expect( onSetMessage ).toHaveBeenCalled();
			expect( onSendTyping ).toHaveBeenCalled();
			expect( onSendNotTyping ).not.toHaveBeenCalled();
		} );

		test( 'should call onSetMessage property and send a noTyping event if message is empty', () => {
			const onSendNotTyping = jest.fn();
			const onSendTyping = jest.fn();
			const onSetMessage = jest.fn();
			const wrapper = shallow(
				<Composer
					message={ '' }
					onSetMessage={ onSetMessage }
					onSendTyping={ onSendTyping }
					onSendNotTyping={ onSendNotTyping }
				/>
			);
			wrapper.find( 'textarea' ).simulate( 'change', { target: { value: '' } } );
			expect( onSetMessage ).toHaveBeenCalled();
			expect( onSendTyping ).not.toHaveBeenCalled();
			expect( onSendNotTyping ).toHaveBeenCalled();
		} );
	} );

	describe( 'onKeyDown event ', () => {
		test( 'should call message and noTyping props if message is not empty', () => {
			const onSendMessage = jest.fn();
			const onSendNotTyping = jest.fn();
			const wrapper = shallow(
				<Composer
					message={ 'hey' }
					onSendMessage={ onSendMessage }
					onSendNotTyping={ onSendNotTyping }
				/>
			);
			wrapper.find( 'textarea' ).simulate( 'keydown', { which: 13, preventDefault: () => {} } );
			expect( onSendMessage ).toHaveBeenCalled();
			expect( onSendNotTyping ).toHaveBeenCalled();
		} );

		test( 'should call message and noTyping props if message is empty', () => {
			const onSendMessage = jest.fn();
			const onSendNotTyping = jest.fn();
			const wrapper = shallow(
				<Composer
					message={ '' }
					onSendMessage={ onSendMessage }
					onSendNotTyping={ onSendNotTyping }
				/>
			);
			wrapper.find( 'textarea' ).simulate( 'keydown', { which: 13, preventDefault: () => {} } );
			expect( onSendMessage ).not.toHaveBeenCalled();
			expect( onSendNotTyping ).not.toHaveBeenCalled();
		} );
	} );
} );
