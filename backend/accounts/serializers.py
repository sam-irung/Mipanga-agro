from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Utilisateur

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'first_name', 'last_name', 'telephone', 'email', 'province', 'territoire', 'password', 'password_confirm']
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
        }

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Les mots de passe ne correspondent pas."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = Utilisateur(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            telephone=validated_data['telephone'],
            email=validated_data.get('email', ''),
            province=validated_data['province'],
            territoire=validated_data['territoire'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'first_name', 'last_name', 'telephone', 'email', 'province', 'territoire', 'date_inscription']