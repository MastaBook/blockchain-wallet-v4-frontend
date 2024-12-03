import styled from 'styled-components'

import { media } from 'services/styles'

const isSofiUrl = window.location.hash.includes('sofi')

export const Wrapper = styled.div<{ isSofi?: boolean }>`
  padding: 32px;
  border-radius: 8px;
  box-sizing: border-box;
  background-color: ${(props) => props.theme.white};
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.21);
  width: 480px;

  ${media.tablet`
    width: 100%;
  `}
  ${media.mobile`
    padding: 20px;
    box-shadow: ${(props) =>
      props.isSofi || isSofiUrl ? 'none' : '0 2px 8px 0 rgba(0, 0, 0, 0.21)'};

  `}
`

export default Wrapper
