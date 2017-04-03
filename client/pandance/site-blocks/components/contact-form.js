/**
 * External dependencies
 */
import React from 'react';

import Card from 'components/card';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextArea from 'components/forms/form-textarea';

export default props => <Card>
		<FormSectionHeading>Contact __BIZNAME__</FormSectionHeading>
		<FormFieldset>
			<FormLabel>Name</FormLabel>
			<FormTextInput placeholder="John Doe"></FormTextInput>
		</FormFieldset>

		<FormFieldset>
			<FormLabel>Email</FormLabel>
			<FormTextInput placeholder="john@example.com"></FormTextInput>
		</FormFieldset>

		<FormFieldset>
			<FormLabel>Message</FormLabel>
			<FormTextArea placeholder="You're awesome!"></FormTextArea>
		</FormFieldset>

	</Card>;

