import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const Disqus = ({ pageSlug, pageTitle, pageUrl, shortname }) => {
  const config = function() {
    this.page.identifier = pageSlug;

    if (pageTitle) {
      this.page.title = pageTitle;
    }

    if (pageUrl) {
      this.page.url = pageUrl;
    }
  };

  useEffect(() => {
    if (window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config,
      });
    } else {
      window.disqus_config = config;

      const script = document.createElement('script');
      script.src = `https://${shortname}.disqus.com/embed.js`;
      script.setAttribute('data-timestamp', +new Date());
      script.setAttribute('async', true);

      document.body.appendChild(script);
    }
  });

  return <div id="disqus_thread" />;
};

Disqus.propTypes = {
  pageSlug: PropTypes.string.isRequired,
  pageTitle: PropTypes.string,
  pageUrl: PropTypes.string,
  shortname: PropTypes.string.isRequired,
};

export default Disqus;
