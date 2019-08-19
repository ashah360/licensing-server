FROM mhart/alpine-node:latest
ADD package.json /tmp/package.json
RUN cd /tmp && npm install && \
	mkdir -p /opt && cp -a /tmp/node_modules /opt

WORKDIR /opt
ADD . /opt

CMD ["node", "server.js"]