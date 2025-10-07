<template>
    <div class="card bg-base-100 shadow-lg qr-code-container">
        <div class="card-body p-3">
            <img :src="qrCode" class="w-48 h-48 mx-auto rounded-lg" alt="QR Code" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'QRCodeDisplay',
    props: {
        qrCode: {
            type: String,
            required: true
        }
    }
}
</script>