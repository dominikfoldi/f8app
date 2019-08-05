FROM node:10.15.2

ADD . .
RUN ["npm", "install"]
RUN ["npm", "run", "build"]

ENTRYPOINT [ "node", "lib/index.js" ]
