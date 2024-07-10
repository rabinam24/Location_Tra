import { Button } from '@mantine/core';

const GitHubIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ width: '1rem', height: '1rem' }}
      {...props}
    >
      <path d="M12 0C5.372 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.111.82-.26.82-.577 0-.285-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.746.083-.73.083-.73 1.205.084 1.838 1.238 1.838 1.238 1.07 1.835 2.809 1.305 3.492.997.108-.775.42-1.305.763-1.605-2.665-.304-5.466-1.334-5.466-5.933 0-1.31.467-2.382 1.235-3.221-.123-.303-.535-1.524.118-3.176 0 0 1.007-.322 3.3 1.23a11.51 11.51 0 013.003-.403c1.018.005 2.042.137 3.003.402 2.292-1.552 3.298-1.23 3.298-1.23.655 1.653.243 2.874.12 3.177.77.84 1.233 1.912 1.233 3.22 0 4.61-2.803 5.625-5.475 5.921.43.37.823 1.102.823 2.222 0 1.606-.015 2.897-.015 3.293 0 .32.217.694.825.577C20.565 21.797 24 17.299 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
};

const GitHubButton = (props) => {
  return (
    <Button
      leftSection={<GitHubIcon style={{ width: '1rem', height: '1rem' }} />}
      variant="default"
      {...props}
    />
  );
};

export default GitHubButton;
