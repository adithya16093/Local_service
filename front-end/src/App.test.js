import { render, screen } from '@testing-library/react';
import App from './App';

// This test checks if the main title on your Home page renders correctly.
test('renders the main title on the home page', () => {
  render(<App />);
  
  // Looks for an element with the text "Find & Book" from your H1 tag.
  const titleElement = screen.getByText(/Find & Book/i);
  
  // Asserts that the title was found in the document.
  expect(titleElement).toBeInTheDocument();
});