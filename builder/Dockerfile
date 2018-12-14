FROM node:11-stretch

# Update apt repositories
RUN apt-get update && \
    apt-get upgrade -y \
    && apt-get install -y zip \
                          python3-pip

# Install meson and ninja
ENV NINJA_VERSION v1.8.2
ENV NINJA_SHA256 d2fea9ff33b3ef353161ed906f260d565ca55b8ca0568fa07b1d2cab90a84a07
RUN curl -L -o ninja-linux-$NINJA_VERSION.zip https://github.com/ninja-build/ninja/releases/download/${NINJA_VERSION}/ninja-linux.zip
RUN echo "${NINJA_SHA256}  ninja-linux-${NINJA_VERSION}.zip" | sha256sum -c -
RUN unzip ninja-linux-${NINJA_VERSION}.zip
RUN mv ninja /usr/bin/ninja
RUN pip3 install meson

# We share some dependencies with NodeJS, so we must use exactly the
# same versions of them since our library will be running the same
# process (and everything is statically linked into the node binary).
# So get the nodejs source code and build them.
RUN git clone https://github.com/nodejs/node /usr/local/src/node
RUN cd /usr/local/src/node && git checkout $(node --version)

# Zlib from NodeJS
RUN cd /usr/local/src/node/deps/zlib && ./configure
RUN cd /usr/local/src/node/deps/zlib && make
RUN cd /usr/local/src/node/deps/zlib && make install
RUN ldconfig -v

# OpenSSL from NodeJS
# But first hack out test/rsa_complex.c since for some reason node
# stripped this source file.
RUN sed -i -e '/ rsa_complex /s/rsa_complex//' \
           -e '/\[rsa_complex\]=/d' \
           /usr/local/src/node/deps/openssl/openssl/test/build.info
RUN cd /usr/local/src/node/deps/openssl/openssl && ./config
RUN cd /usr/local/src/node/deps/openssl/openssl && make
RUN cd /usr/local/src/node/deps/openssl/openssl && make install
RUN ldconfig -v

# Install cyrus-sasl
ENV SASL_VERSION 2.1.27
ENV SASL_SHA256 26866b1549b00ffd020f188a43c258017fa1c382b3ddadd8201536f72efb05d5
RUN curl -O ftp://ftp.cyrusimap.org/cyrus-sasl/cyrus-sasl-${SASL_VERSION}.tar.gz
RUN echo "${SASL_SHA256}  cyrus-sasl-${SASL_VERSION}.tar.gz" | sha256sum -c -
RUN tar zxf cyrus-sasl-${SASL_VERSION}.tar.gz
RUN cd cyrus-sasl-${SASL_VERSION} && \
    ./configure --enable-static \
                --with-pic \
                --disable-silent-rules \
                --disable-cmulocal \
                --disable-sample \
                --disable-obsolete_cram_attr \
                --disable-obsolete_digest_attr \
                --disable-staticdlopen \
                --disable-java \
                --disable-alwaystrue \
                --enable-checkapop \
                --enable-cram \
                --enable-digest \
                --enable-scram \
                --disable-otp \
                --disable-srp \
                --disable-srp-setpass \
                --disable-krb4 \
                --disable-gssapi \
                --disable-gss_mutexes \
                --disable-sia \
                --disable-auth-sasldb \
                --disable-httpform \
                --enable-plain \
                --enable-anon \
                --enable-login \
                --disable-ntlm \
                --disable-passdss \
                --disable-sql \
                --disable-ldapdb \
                --disable-macos-framework
RUN cd cyrus-sasl-${SASL_VERSION} && make
RUN cd cyrus-sasl-${SASL_VERSION} && make install
RUN ldconfig -v

# Install libetpan
ENV ETPAN_VERSION 1.9.1
ENV ETPAN_SHA256 f5e354ccf1014c6ee313ade1009b8a82f28043d2504655e388bb4c1328700fcd
RUN curl -L -o libetpan-${ETPAN_VERSION}.tar.gz \
    https://github.com/dinhviethoa/libetpan/archive/${ETPAN_VERSION}.tar.gz
RUN echo "${ETPAN_SHA256}  libetpan-${ETPAN_VERSION}.tar.gz" | sha256sum -c -
RUN tar xzf libetpan-${ETPAN_VERSION}.tar.gz
RUN cd libetpan-${ETPAN_VERSION} && \
    ./autogen.sh && \
    ./configure --enable-ipv6 \
                --disable-iconv --disable-db \
                --with-openssl --with-sasl --with-zlib \
                --without-curl --without-expat
RUN cd libetpan-${ETPAN_VERSION} && make
RUN cd libetpan-${ETPAN_VERSION} && make install
RUN ldconfig -v
