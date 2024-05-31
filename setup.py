from setuptools import setup, find_packages


setup(
    name='issuer',
    version='1.0',
    author='littlebutt',
    author_email='luogan199686@gmail.com',
    license='MIT License',
    url="https://github.com/littlebutt/issuer",
    description='A project manager application.',
    package_dir={'issuer': 'app'},
    install_requires=['fastapi>=0.111', 'sqlmodel'],
    python_requires='>=3.10',
    platforms='any'
)
