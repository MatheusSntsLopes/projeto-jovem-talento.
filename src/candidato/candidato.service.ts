import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCandidatoDto } from './dto/create-candidato.dto';
import { UpdateCandidatoDto } from './dto/update-candidato.dto';
import { Candidato } from './entities/candidato.entity';
import { Curriculo } from 'src/curriculo/entities/curriculo.entity';

@Injectable()
export class CandidatoService {
  constructor(
    @InjectModel(Candidato) private readonly candidato: typeof Candidato,
  ) {}

  async create(candidatoDto: CreateCandidatoDto): Promise<Candidato> {
    try {
      const candidatoNovo = {
        ...candidatoDto,
        senha: await bcrypt.hash(candidatoDto.senha, 10),
      };
      const candidatoCriado: Candidato = await this.candidato.create(
        candidatoNovo,
      );

      return candidatoCriado;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  findAll(): Promise<Candidato[]> {
    return this.candidato.findAll({
      attributes: { exclude: ['senha', 'email', 'cpf'] },
      include: Curriculo,
    });
  }

  async findOne(id: number): Promise<Candidato> {
    const candidatoEncontrado: Candidato = await this.candidato.findOne({
      where: { id },
      attributes: { exclude: ['senha', 'email', 'cpf'] },
      include: Curriculo,
    });

    if (!candidatoEncontrado) {
      throw new NotFoundException('Candidato não encontrado.');
    }

    return candidatoEncontrado;
  }

  async update(
    id: number,
    {
      email,
      nome,
      senha,
      cpf,
      bairro,
      cep,
      cidade,
      estado,
      numero,
      rua,
      telefone,
    }: UpdateCandidatoDto,
  ): Promise<Candidato> {
    try {
      const candidatoExiste = await this.candidato.findByPk(id, {
        rejectOnEmpty: true,
      });

      if (!candidatoExiste) {
        throw new Error('Usuario não existe');
      }

      const novosDados = await candidatoExiste.update({
        email,
        nome,
        senha,
        cpf,
        bairro,
        cep,
        cidade,
        estado,
        numero,
        rua,
        telefone,
      });

      return novosDados;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  async remove(id: number) {
    const candidatoexist: Candidato = await this.candidato.findByPk(id);

    if (!candidatoexist) {
      throw new Error('Usuario não existe');
    }

    await this.candidato.destroy({ where: { id } });
  }
}
