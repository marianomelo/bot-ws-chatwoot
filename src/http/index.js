const express = require('express')
const cors = require('cors')
const {join} = require('path')
const {createReadStream} = require('fs')

/**
 * Esta clase esta relacionada con todo lo que tiene que ver
 * con un endpoint o rutas de express para tener un punto de entrada
 * externo y flexible
 */
class ServerHttp {
    app;
    port;

    constructor(_port = 4000){
        this.port = _port
    }

    /**
     * este es el controlador para mostar el qr code
     * @param {*} _ 
     * @param {*} res 
     */
    qrCtrl = (_, res) => {
        const pathQrImage = join(process.cwd(), `bot.qr.png`);
        const fileStream = createReadStream(pathQrImage);
        res.writeHead(200, { "Content-Type": "image/png" });
        fileStream.pipe(res);
    }

    /**
     * Este el controlador del los enventos del Chatwoot
     * @param {*} req 
     * @param {*} res 
     */
chatwootCtrl = async (req, res) => {
    const body = req.body;
    const attachments = body?.attachments;
    const bot = req.bot;
    try {
        const mapperAttributes = body?.changed_attributes?.map((a) => Object.keys(a)).flat(2);
        
        // Procesamiento para la blacklist omitido para enfocarnos en la modificación solicitada

        const checkIfMessage = body?.private == false && body?.event == "message_created" && body?.message_type === "outgoing" && body?.conversation?.channel.includes("Channel::Api");
        if (checkIfMessage) {
            const phone = body.conversation?.meta?.sender?.phone_number.replace('+', '');
            const content = body?.content ?? '';
          
            console.log('BODY:', JSON.stringify(body, null, 2));
            if (attachments && attachments.length) {
                // Iterar sobre todos los archivos adjuntos y enviarlos
                for (const file of attachments) {

		    let file_type=file.file_type;
		    console.log('file_type');
		    console.log(file_type);

		    if (file_type=='file') {
                   	 /**
                   	 * esto envia un mensaje de texto al wsporque para los archivos el bot de whsatsapp no esta enviando el contentadjunto
                    	*/
                   console.log('file_type adentro');

                    	await bot.providerClass.sendMessage(
                      		`${phone}`,
                      		content,
                      		{}
                    	);

		    }

                    console.log(`Este es el archivo adjunto...`, file.data_url);
                    await bot.providerClass.sendMedia(
                        `${phone}@c.us`,
                        file.data_url,
                        content,
                    );
                }
                res.send('ok');
                return;
            }
    
            // Esto envía un mensaje de texto al ws si no hay archivos adjuntos
            await bot.providerClass.sendMessage(
                `${phone}`,
                content,
                {}
            );

            res.send('ok');
            return;
        }

        res.send('ok');
    } catch (error) {
        console.log(error);
        return res.status(405).send('Error');
    }
}

    /**
     * Incia tu server http sera encargador de injectar el instanciamiento del bot
     */
    initialization = (bot = undefined) => {
        if(!bot){
            throw new Error('DEBES_DE_PASAR_BOT')
        }
        this.app = express()
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(express.static('public'))

        this.app.use((req, _, next) => {
            req.bot = bot;
            next()
        })

        this.app.post(`/chatwoot`, this.chatwootCtrl)
        this.app.get('/scan-qr',this.qrCtrl)

        this.app.listen(this.port, () => {
            console.log(``)
            console.log(`ðŸ¦® http://localhost:${this.port}/scan-qr`)
            console.log(``)
        })
    }

}

module.exports = ServerHttp