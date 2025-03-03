   import '@testing-library/jest-dom';
   import { render, screen } from '@testing-library/react';
   import Page from '../app/page';

   describe('Page', () => {
       it('should render root page', async () => {
           render(<Page />);
           const paragraph = await screen.findByText('Root');
           expect(paragraph).toBeInTheDocument();
       });
   });