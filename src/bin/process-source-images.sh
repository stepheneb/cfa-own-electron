#!/bin/sh

./src/bin/extract.py ./src/source-images/fits/jupiter-animate 000000000000000
./src/bin/extract.py ./src/source-images/fits/HST_Lagoon 000
./src/bin/extract.py ./src/source-images/fits/m51 000
./src/bin/extract.py ./src/source-images/fits/m51-multi 111
./src/bin/extract.py ./src/source-images/fits/M82 000

./src/bin/extract-jpg.py ./src/source-images/jpg/potw1345a/
./src/bin/extract-jpg.py ./src/source-images/jpg/opo9914d/
./src/bin/extract-jpg.py ./src/source-images/jpg/heic2007a

./src/bin/extract-jpg-grayscale.py ./src/source-images/jpg/WAC_GL000/
./src/bin/extract-jpg-grayscale.py ./src/source-images/jpg/WAC_GL180/

./src/bin/extract-png-grayscale.py ./src/source-images/png/2014_01_02__20_28_23_34__SDO_AIA_AIA_171
./src/bin/extract-png-grayscale.py ./src/source-images/png/2014_01_03__20_28_11_34__SDO_AIA_AIA_171
./src/bin/extract-png-grayscale.py ./src/source-images/png/2014_01_04__20_28_23_34__SDO_AIA_AIA_171
./src/bin/extract-png-grayscale.py ./src/source-images/png/2014_01_05__20_28_23_34__SDO_AIA_AIA_171
./src/bin/extract-png-grayscale.py ./src/source-images/png/2014_01_06__20_28_23_34__SDO_AIA_AIA_171
./src/bin/extract-png-grayscale.py ./src/source-images/png/2014_01_07__20_28_11_34__SDO_AIA_AIA_171
./src/bin/extract-png-grayscale.py ./src/source-images/png/2014_01_08__20_28_11_34__SDO_AIA_AIA_171
./src/bin/extract-png-grayscale.py ./src/source-images/png/2014_01_09__20_28_23_35__SDO_AIA_AIA_171
./src/bin/extract-png-grayscale.py ./src/source-images/png/2014_01_10__20_28_23_34__SDO_AIA_AIA_171
./src/bin/extract-png-grayscale.py ./src/source-images/png/2014_01_11__20_27_59_34__SDO_AIA_AIA_171
