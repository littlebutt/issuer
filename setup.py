from setuptools import setup


setup(
    name='issuer',
    version='1.0',
    author='littlebutt',
    author_email='luogan199686@gmail.com',
    license='MIT License',
    url="https://github.com/littlebutt/issuer",
    description='A project manager application.',
    packages=['issuer'],
    install_requires=['fastapi>=0.111',
                      'sqlmodel',
                      'httpx>=0.27.0',
                      'python-multipart>=0.0.9',
                      'python-dotenv>=1.0.1'],
    python_requires='>=3.10',
    platforms='any'
)
